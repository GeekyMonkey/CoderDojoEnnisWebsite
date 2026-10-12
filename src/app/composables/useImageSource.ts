import { ref, onScopeDispose, type Ref } from "vue";
import { imageSourceSchema } from "#shared/types/ImageUpload";
type ImageSource = { image: Ref<HTMLImageElement | null>; loading: Ref<boolean>; error: Ref<boolean>; choose: (file: File) => Promise<HTMLImageElement | null>; close: () => void };
/** Decode validated images for reusable crop editors and release temporary browser resources. */
export function useImageSource(): ImageSource {
 const image: Ref<HTMLImageElement | null> = ref(null);
 const loading: Ref<boolean> = ref(false);
 const error: Ref<boolean> = ref(false);
 let sourceUrl: string | null = null;
 let sequence: number = 0;
 /** Cancel decoding and release the previous temporary image. */
 function close(): void { sequence++; image.value = null; loading.value = false; if (sourceUrl) URL.revokeObjectURL(sourceUrl); sourceUrl = null; }
 /** Apply shared file and decoded-pixel limits before presenting an editor. */
 async function choose(file: File): Promise<HTMLImageElement | null> {
  close(); error.value = false;
  const validated: ReturnType<typeof imageSourceSchema.safeParse> = imageSourceSchema.safeParse(file);
  if (!validated.success) { error.value = true; return null; }
  const request: number = ++sequence;
  loading.value = true;
  sourceUrl = URL.createObjectURL(validated.data);
  const decoded: HTMLImageElement = new Image(); decoded.src = sourceUrl;
  try {
   await decoded.decode();
   if (sequence !== request) return null;
   if (!decoded.naturalWidth || !decoded.naturalHeight || decoded.naturalWidth * decoded.naturalHeight > 50_000_000) throw new Error("Invalid image size");
   image.value = decoded; return decoded;
  } catch { if (sequence === request) { close(); error.value = true; } return null; }
  finally { if (sequence === request) loading.value = false; }
 }
 onScopeDispose(close);
 return { image, loading, error, choose, close };
}
