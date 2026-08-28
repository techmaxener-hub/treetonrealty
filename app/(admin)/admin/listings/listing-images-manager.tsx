"use client";

import { useRef, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { getPublicMediaUrl } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteListingImage,
  insertListingImage,
  reorderListingImages,
  updateListingImage,
} from "./actions";
import { ROOM_CATEGORIES, type ListingImageRow, type RoomCategory } from "./types";

function SortableImageCard({
  image,
  listingId,
  onDelete,
}: {
  image: ListingImageRow;
  listingId: string;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });
  const [altText, setAltText] = useState(image.alt_text);
  const [category, setCategory] = useState<RoomCategory>(image.room_category);
  const [isPending, startTransition] = useTransition();

  function saveAlt() {
    if (altText === image.alt_text) return;
    startTransition(() => {
      updateListingImage(image.id, listingId, { alt_text: altText });
    });
  }

  function saveCategory(value: string) {
    setCategory(value as RoomCategory);
    startTransition(() => {
      updateListingImage(image.id, listingId, {
        room_category: value as RoomCategory,
      });
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center gap-3 rounded-md border border-border-subtle bg-white p-3 ${
        isDragging ? "z-10 opacity-70" : ""
      }`}
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getPublicMediaUrl(image.storage_path)}
        alt={image.alt_text}
        className="h-16 w-16 shrink-0 rounded-sm object-cover"
      />
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          onBlur={saveAlt}
          placeholder="Alt text"
          className="h-9 max-w-xs"
        />
        <Select value={category} onValueChange={saveCategory}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROOM_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isPending ? <span className="text-xs text-muted-foreground">Saving...</span> : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onDelete(image.id)}
        className="text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ListingImagesManager({
  listingId,
  images: initialImages,
}: {
  listingId: string;
  images: ListingImageRow[];
}) {
  const [images, setImages] = useState(
    [...initialImages].sort((a, b) => a.display_order - b.display_order)
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    const supabase = createSupabaseBrowserClient();

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `listings/${listingId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from("public-media")
        .upload(path, file, { upsert: false });

      if (uploadErr) {
        setUploadError(uploadErr.message);
        continue;
      }

      const displayOrder = images.length;
      const result = await insertListingImage(
        listingId,
        path,
        file.name.replace(/\.[^.]+$/, ""),
        "Living Room",
        displayOrder
      );

      if (result.error) {
        setUploadError(result.error);
        await supabase.storage.from("public-media").remove([path]);
        continue;
      }

      setImages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          listing_id: listingId,
          storage_path: path,
          alt_text: file.name.replace(/\.[^.]+$/, ""),
          room_category: "Living Room",
          display_order: displayOrder,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDelete(imageId: string) {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    deleteListingImage(imageId, listingId, image.storage_path);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const oldIndex = prev.findIndex((img) => img.id === active.id);
      const newIndex = prev.findIndex((img) => img.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      reorderListingImages(
        listingId,
        reordered.map((img) => img.id)
      );
      return reordered;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
          id="listing-image-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload photos"}
        </Button>
        {uploadError ? <p className="mt-1 text-sm text-destructive">{uploadError}</p> : null}
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No photos yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {images.map((image) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  listingId={listingId}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
