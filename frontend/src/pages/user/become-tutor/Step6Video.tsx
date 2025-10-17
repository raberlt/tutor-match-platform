import React, { useMemo } from "react";

interface Props {
  videoUrl: string;
  setFormData: React.Dispatch<
    React.SetStateAction<{
      [key: string]: any;
    }>
  >;
  errors: Record<string, string>;
}

function getYoutubeEmbed(url: string): string | null {
  try {
    if (!url) return null;
    const ytRegex =
      /(youtu\.be\/|youtube\.com\/(watch\?v=|embed\/))([A-Za-z0-9_-]{11})/;
    const m = url.match(ytRegex);
    const id = m ? m[3] : null;
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

export const Step6Video: React.FC<Props> = ({
  videoUrl,
  setFormData,
  errors,
}) => {
  const embedUrl = useMemo(() => getYoutubeEmbed(videoUrl), [videoUrl]);

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#f0f8ff", border: "1px solid #94cce6" }}
      >
        <h4 className="font-semibold mb-2" style={{ color: "#94cce6" }}>
          Video giới thiệu (khuyến khích)
        </h4>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>
            Độ dài 30-90 giây, giới thiệu bản thân và phong cách giảng dạy
          </li>
          <li>Hỗ trợ liên kết YouTube: dán URL video của bạn</li>
        </ul>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Link YouTube (tùy chọn)
        </label>
        <input
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
          placeholder="https://www.youtube.com/watch?v=xxxxxx"
          value={videoUrl}
          onChange={(e) =>
            setFormData((p) => ({ ...p, videoUrl: e.target.value }))
          }
        />
        {errors.videoUrl && (
          <p className="text-xs text-red-600 mt-1">{errors.videoUrl}</p>
        )}
      </div>

      {embedUrl && (
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title="Tutor Intro Video"
          />
        </div>
      )}
    </div>
  );
};

export default Step6Video;
