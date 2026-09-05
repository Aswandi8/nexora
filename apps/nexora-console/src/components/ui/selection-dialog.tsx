"use client";

import { AlertCircle, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export interface SelectionDialogOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectionDialogProps<T extends string> {
  open: boolean;
  title: string;
  description: string;
  fieldLabel: string;
  value: T;
  options: SelectionDialogOption<T>[];
  subjectName?: string;
  subjectDescription?: string;
  currentValue?: ReactNode;
  information?: ReactNode;
  placeholder?: string;
  submitLabel?: string;
  pending?: boolean;
  renderValue?: (option: SelectionDialogOption<T>) => ReactNode;
  renderOption?: (option: SelectionDialogOption<T>) => ReactNode;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: T) => void | Promise<void>;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function SelectionDialog<T extends string>({
  open,
  title,
  description,
  fieldLabel,
  value,
  options,
  subjectName,
  subjectDescription,
  currentValue,
  information,
  placeholder = "Pilih opsi",
  submitLabel = "Simpan Perubahan",
  pending = false,
  renderValue,
  renderOption,
  onOpenChange,
  onSubmit,
}: SelectionDialogProps<T>) {
  const [selectedValue, setSelectedValue] = useState(value);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue],
  );

  const changed = selectedValue !== value;

  function handleOpenChange(nextOpen: boolean) {
    if (pending) return;

    if (!nextOpen) {
      setSelectedValue(value);
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit() {
    if (!changed || pending || !selectedOption) return;
    await onSubmit(selectedValue);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-xl overflow-hidden p-0">
        <div className="relative border-b border-border px-6 py-5">
          <AlertDialogHeader className="pr-10">
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={pending}
              aria-label="Tutup"
              className="absolute right-4 top-4 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </AlertDialogCancel>
        </div>

        <div className="space-y-5 px-6 py-5">
          {subjectName ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/25 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
                {getInitials(subjectName)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {subjectName}
                </p>

                {subjectDescription ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {subjectDescription}
                  </p>
                ) : null}
              </div>

              {currentValue ? (
                <div className="shrink-0">{currentValue}</div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {fieldLabel}
            </label>

            <Select
              value={selectedValue}
              onValueChange={(nextValue) => setSelectedValue(nextValue as T)}
              disabled={pending}
            >
              <SelectTrigger
                className="h-12 w-full rounded-lg px-3"
                aria-label={fieldLabel}
              >
                <div className="min-w-0 flex-1 text-left">
                  {selectedOption ? (
                    renderValue ? (
                      renderValue(selectedOption)
                    ) : (
                      <span className="truncate text-sm font-medium text-foreground">
                        {selectedOption.label}
                      </span>
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {placeholder}
                    </span>
                  )}
                </div>
              </SelectTrigger>

              <SelectContent className="z-100 max-h-72">
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="py-2.5"
                  >
                    {renderOption ? (
                      renderOption(option)
                    ) : (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {option.label}
                        </p>

                        {option.description ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {information ? (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/25 px-4 py-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

              <div className="text-xs leading-5 text-muted-foreground">
                {information}
              </div>
            </div>
          ) : null}
        </div>

        <AlertDialogFooter className="m-0 border-t border-border px-6 py-4">
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Batal
            </Button>
          </AlertDialogCancel>

          <Button
            type="button"
            disabled={!changed || pending}
            onClick={() => void handleSubmit()}
          >
            {pending ? "Menyimpan..." : submitLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
