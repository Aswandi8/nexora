"use client";

import {
  createShortlinkSchema,
  type Shortlink,
  type ShortlinkStatus,
  type UpdateShortlinkInput,
} from "@nexora/contracts";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { WorkspaceLoading } from "@/components/feedback/workspace-loading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import { useToast } from "@/hooks/use-toast";

import {
  createShortlinkAction,
  updateShortlinkAction,
} from "../shortlinks.actions";
import {
  displayDurationMsToParts,
  durationPartsToMs,
} from "../shortlink.utils";
import { DurationInput } from "./duration-input";
import { ShortlinkPreview } from "./shortlink-preview";

interface ShortlinkFormProps {
  shortlink?: Shortlink;
}

export function ShortlinkForm({ shortlink }: ShortlinkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = Boolean(shortlink);

  const initialDuration = displayDurationMsToParts(
    shortlink?.displayDurationMs ?? 15_000,
  );

  const [slug, setSlug] = useState(shortlink?.slug ?? "");
  const [destinationUrl, setDestinationUrl] = useState(
    shortlink?.destinationUrl ?? "",
  );
  const [title, setTitle] = useState(shortlink?.title ?? "");
  const [description, setDescription] = useState(shortlink?.description ?? "");
  const [mediaUrl, setMediaUrl] = useState(shortlink?.mediaUrl ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    initialDuration.minutes,
  );
  const [durationSeconds, setDurationSeconds] = useState(
    initialDuration.seconds,
  );
  const [status, setStatus] = useState<ShortlinkStatus>(
    shortlink?.status ?? "ACTIVE",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayDurationMs = durationPartsToMs(durationMinutes, durationSeconds);

  const mediaUnchanged =
    Boolean(shortlink) && mediaUrl.trim() === shortlink?.mediaUrl;

  function setValidationErrors(
    issues: Array<{
      path: PropertyKey[] | readonly PropertyKey[];
      message: string;
    }>,
  ) {
    const nextErrors: Record<string, string> = {};

    for (const issue of issues) {
      const key = issue.path[0]?.toString() ?? "_root";
      nextErrors[key] ??= issue.message;
    }

    setErrors(nextErrors);
  }

  function handleMediaUrlChange(value: string) {
    setMediaUrl(value);
    setErrors((current) => ({
      ...current,
      mediaUrl: "",
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const parsed = createShortlinkSchema.safeParse({
      slug,
      destinationUrl,
      title,
      description: description.trim() || null,
      mediaUrl,
      displayDurationMs,
      status,
    });

    if (!parsed.success) {
      setValidationErrors(parsed.error.issues);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let result;

      if (isEditing && shortlink) {
        const updateInput: UpdateShortlinkInput = {
          ...parsed.data,
        };

        if (mediaUnchanged) {
          delete updateInput.mediaUrl;
        }

        result = await updateShortlinkAction(shortlink.id, updateInput);
      } else {
        result = await createShortlinkAction(parsed.data);
      }

      if (!result.success) {
        if (result.fields) {
          const nextErrors: Record<string, string> = {};

          for (const [field, messages] of Object.entries(result.fields)) {
            const message = messages[0];

            if (message) {
              nextErrors[field] = message;
            }
          }

          setErrors(nextErrors);
        }

        toast({
          title: isEditing
            ? "Shortlink update failed"
            : "Shortlink creation failed",
          description: result.message ?? "Unable to save shortlink.",
          variant: "destructive",
        });

        setIsSubmitting(false);
        return;
      }

      toast({
        title: isEditing ? "Shortlink updated" : "Shortlink created",
        description: isEditing
          ? "Shortlink changes have been saved."
          : "The new shortlink is ready.",
        variant: "success",
      });

      router.push("/shortlinks");
    } catch (error) {
      console.error(error);

      toast({
        title: isEditing
          ? "Shortlink update failed"
          : "Shortlink creation failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]"
      >
        <Card className="min-w-0 p-5 sm:p-6">
          <div className="mb-6">
            <Typography as="h2" variant="h3">
              Shortlink details
            </Typography>

            <Typography variant="muted" className="mt-1">
              Configure the destination, social metadata, and public image.
            </Typography>
          </div>

          <div className="grid gap-5">
            <FormField
              label="Slug"
              htmlFor="shortlink-slug"
              description="Lowercase letters, numbers, and hyphens only."
              error={errors.slug}
            >
              <Input
                id="shortlink-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                disabled={isSubmitting}
                placeholder="my-shortlink"
                autoComplete="off"
              />
            </FormField>

            <FormField
              label="Destination URL"
              htmlFor="shortlink-destination"
              description="Where visitors should be sent."
              error={errors.destinationUrl}
            >
              <Input
                id="shortlink-destination"
                type="url"
                value={destinationUrl}
                onChange={(event) => setDestinationUrl(event.target.value)}
                disabled={isSubmitting}
                placeholder="https://example.com/article"
                autoComplete="off"
              />
            </FormField>

            <FormField
              label="Title"
              htmlFor="shortlink-title"
              error={errors.title}
            >
              <Input
                id="shortlink-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isSubmitting}
                placeholder="Preview title"
                autoComplete="off"
              />
            </FormField>

            <FormField
              label="Description"
              htmlFor="shortlink-description"
              error={errors.description}
            >
              <Textarea
                id="shortlink-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isSubmitting}
                placeholder="Optional preview description."
                rows={4}
                className="resize-none"
              />
            </FormField>

            <FormField
              label="Image URL"
              htmlFor="shortlink-media"
              description="A public direct image URL. Browser preview is local; Core performs trusted verification only on Save."
              error={errors.mediaUrl}
            >
              <Input
                id="shortlink-media"
                type="url"
                value={mediaUrl}
                onChange={(event) => handleMediaUrlChange(event.target.value)}
                disabled={isSubmitting}
                placeholder="https://cdn.example.com/image.jpg"
                autoComplete="off"
              />
            </FormField>

            <FormField
              label="Display duration"
              htmlFor="shortlink-duration-minutes"
              description="Visual duration shown on the preview. Minutes and seconds are limited to 00–59."
              error={errors.displayDurationMs}
            >
              <DurationInput
                minutes={durationMinutes}
                seconds={durationSeconds}
                disabled={isSubmitting}
                onMinutesChange={setDurationMinutes}
                onSecondsChange={setDurationSeconds}
              />
            </FormField>

            <FormField
              label="Status"
              htmlFor="shortlink-status"
              description="Inactive shortlinks remain stored but are not intended for public use."
              error={errors.status}
            >
              <Select
                value={status}
                disabled={isSubmitting}
                onValueChange={(value) => setStatus(value as ShortlinkStatus)}
              >
                <SelectTrigger id="shortlink-status">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </Card>

        <div className="min-w-0 xl:row-span-2 xl:col-start-2 xl:row-start-1">
          <ShortlinkPreview
            slug={slug}
            title={title}
            description={description}
            mediaUrl={mediaUrl}
            displayDurationMs={displayDurationMs}
            status={status}
            mediaWidth={mediaUnchanged ? shortlink?.mediaWidth : undefined}
            mediaHeight={mediaUnchanged ? shortlink?.mediaHeight : undefined}
            mimeType={mediaUnchanged ? shortlink?.mimeType : undefined}
            contentLength={
              mediaUnchanged ? shortlink?.contentLength : undefined
            }
            sticky
          />
        </div>

        <Card className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href="/shortlinks"
              className={buttonVariants({
                variant: "outline",
              })}
              aria-disabled={isSubmitting}
            >
              Cancel
            </Link>

            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? "Save changes" : "Create shortlink"}
            </Button>
          </div>
        </Card>
      </form>

      {isSubmitting ? <WorkspaceLoading /> : null}
    </>
  );
}
