import React from "react";

type AudienceOption = { id: number; name: string };

interface Props {
  bio: string;
  headline: string;
  experience: string;
  teachingAudiences: string[]; // names selected
  audiencesOptions: AudienceOption[];
  setFormData: React.Dispatch<
    React.SetStateAction<{
      [key: string]: any;
    }>
  >;
  errors: Record<string, string>;
}

export const Step5IntroAudience: React.FC<Props> = ({
  bio,
  headline,
  experience,
  teachingAudiences,
  audiencesOptions,
  setFormData,
  errors,
}) => {
  const toggleAudience = (name: string) => {
    setFormData((prev) => {
      const exists = (prev.teachingAudiences as string[]).includes(name);
      const next = exists
        ? (prev.teachingAudiences as string[]).filter((n) => n !== name)
        : [...(prev.teachingAudiences as string[]), name];
      return { ...prev, teachingAudiences: next };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tiêu đề hồ sơ (headline) *
        </label>
        <input
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
          placeholder="Ví dụ: Gia sư Toán 5 năm kinh nghiệm, phương pháp dễ hiểu"
          value={headline}
          onChange={(e) =>
            setFormData((p) => ({ ...p, headline: e.target.value }))
          }
        />
        {errors.headline && (
          <p className="text-xs text-red-600 mt-1">{errors.headline}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Giới thiệu bản thân (bio) *
        </label>
        <textarea
          rows={5}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
          placeholder="Giới thiệu ngắn gọn về bản thân, phong cách giảng dạy, thành tích..."
          value={bio}
          onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
        />
        {errors.bio && (
          <p className="text-xs text-red-600 mt-1">{errors.bio}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kinh nghiệm giảng dạy
        </label>
        <textarea
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
          placeholder="Mô tả kinh nghiệm nổi bật của bạn"
          value={experience}
          onChange={(e) =>
            setFormData((p) => ({ ...p, experience: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Đối tượng học (chọn một hoặc nhiều)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {audiencesOptions.map((aud) => {
            const checked = teachingAudiences.includes(aud.name);
            return (
              <label
                key={aud.id}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAudience(aud.name)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-800">{aud.name}</span>
              </label>
            );
          })}
        </div>
        {errors.teachingAudiences && (
          <p className="text-xs text-red-600 mt-1">
            {errors.teachingAudiences}
          </p>
        )}
      </div>
    </div>
  );
};

export default Step5IntroAudience;


