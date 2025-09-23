package fsa.training.tutormatch.enums;

/**
 * Enum định nghĩa các cấp độ học vấn
 */
public enum EducationLevel {
    MIDDLE_SCHOOL("Trung học cơ sở"),          // cấp 2
    HIGH_SCHOOL("Trung học phổ thông"),        // cấp 3
    VOCATIONAL_SCHOOL("Trung cấp nghề"),       // trung cấp, dạy nghề
    COLLEGE_UNIVERSITY("Cao đẳng / Đại học"),  // gộp cao đẳng và đại học
    POSTGRADUATE("Sau đại học"),               // thạc sĩ, tiến sĩ
    WORKING_PROFESSIONAL("Người đi làm"),      // đã đi làm
    INDEPENDENT_LEARNER("Học tự do");          // người học tự do

    private final String displayName;

    EducationLevel(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
