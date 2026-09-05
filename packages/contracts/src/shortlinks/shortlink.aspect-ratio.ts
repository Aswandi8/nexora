import {
  SHORTLINK_IMAGE_ASPECT_RATIO_HEIGHT,
  SHORTLINK_IMAGE_ASPECT_RATIO_TOLERANCE,
  SHORTLINK_IMAGE_ASPECT_RATIO_WIDTH,
} from "./shortlink.constants";

export interface ShortlinkImageAspectRatioResult {
  valid: boolean;
  ratio: number;
  targetRatio: number;
  minRatio: number;
  maxRatio: number;
  difference: number;
}

export function getShortlinkImageAspectRatio(
  width: number,
  height: number,
): ShortlinkImageAspectRatioResult {
  const targetRatio =
    SHORTLINK_IMAGE_ASPECT_RATIO_WIDTH / SHORTLINK_IMAGE_ASPECT_RATIO_HEIGHT;

  const minRatio = targetRatio * (1 - SHORTLINK_IMAGE_ASPECT_RATIO_TOLERANCE);

  const maxRatio = targetRatio * (1 + SHORTLINK_IMAGE_ASPECT_RATIO_TOLERANCE);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return {
      valid: false,
      ratio: 0,
      targetRatio,
      minRatio,
      maxRatio,
      difference: 1,
    };
  }

  const ratio = width / height;
  const difference = Math.abs(ratio - targetRatio) / targetRatio;

  return {
    valid: difference <= SHORTLINK_IMAGE_ASPECT_RATIO_TOLERANCE,
    ratio,
    targetRatio,
    minRatio,
    maxRatio,
    difference,
  };
}

export function isValidShortlinkImageAspectRatio(
  width: number,
  height: number,
): boolean {
  return getShortlinkImageAspectRatio(width, height).valid;
}
