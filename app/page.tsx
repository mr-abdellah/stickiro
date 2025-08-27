import { ClientOnlyWrapper } from "@/components/ClientOnlyWrapper";
import { StickerGenerator } from "@/components/sticker/StickerGenerator";

export default function Home() {
  return (
    <ClientOnlyWrapper>
      <StickerGenerator />
    </ClientOnlyWrapper>
  );
}
