import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg,#0f5132,#198754,#2e8b57)",
          color: "white",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <img
          src="/logo/rain-villa-logo.jpeg"
          width={180}
          height={180}
          style={{
            borderRadius: 20,
            marginBottom: 30,
            objectFit: "cover",
            background: "white",
          }}
        />

        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          THE RAIN VILLA
        </div>

        <div
          style={{
            fontSize: 30,
            marginTop: 20,
            color: "#d8ffe5",
          }}
        >
          Luxury Villa Booking & Guest Consent
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            color: "#d8ffe5",
          }}
        >
          www.therainvilla.com
        </div>
      </div>
    ),
    size
  );
}