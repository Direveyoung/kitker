import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#7b66b5",
          color: "#faf7f2",
          fontSize: 120,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
        }}
      >
        e
      </div>
    ),
    { ...size },
  );
}
