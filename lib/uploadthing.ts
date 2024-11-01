import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { UploadButton: BaseUploadButton, UploadDropzone } =
  generateComponents<OurFileRouter>();

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();