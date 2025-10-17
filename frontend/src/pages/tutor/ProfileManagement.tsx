import React, { useEffect } from "react";
import { BecomeTutor } from "../user/BecomeTutor";
import { TutorService } from "../../services/tutorService";

export const ProfileManagement: React.FC = () => {
  useEffect(() => {
    // Gọi API load draft mỗi khi mở trang /tutor/profile
    (async () => {
      try {
        await TutorService.getDraftData();
      } catch (err) {
        // noop
      }
    })();
  }, []);

  return <BecomeTutor />;
};
