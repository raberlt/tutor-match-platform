package fsa.training.tutormatch.service;

import fsa.training.tutormatch.entity.User;
import fsa.training.tutormatch.entity.TrialSession;
import fsa.training.tutormatch.repository.TrialSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class TrialService {

    @Autowired
    private TrialSessionRepository trialSessionRepository;

    /**
     * Kiểm tra xem học viên có thể học thử với gia sư này không
     */
    public boolean canTakeTrial(User student, User tutor) {
        return trialSessionRepository.countCompletedTrialsByStudentAndTutor(student, tutor) == 0;
    }

    /**
     * Tạo bản ghi học thử
     */
    public TrialSession createTrialSession(User student, User tutor) {
        TrialSession trialSession = new TrialSession();
        trialSession.setStudent(student);
        trialSession.setTutor(tutor);
        return trialSessionRepository.save(trialSession);
    }

    /**
     * Đánh dấu học thử đã hoàn thành
     */
    public void completeTrialSession(User student, User tutor) {
        Optional<TrialSession> trialOpt = trialSessionRepository.findByStudentAndTutor(student, tutor);
        if (trialOpt.isPresent()) {
            TrialSession trial = trialOpt.get();
            trial.setCompletedAt(LocalDateTime.now());
            trialSessionRepository.save(trial);
        }
    }

    /**
     * Tính phí học thử (50% giá gốc)
     */
    public double calculateTrialFee(double originalFee) {
        return originalFee * 0.5;
    }

    /**
     * Tính số buổi được giảm giá dựa trên số buổi đăng ký
     * Mỗi 12 buổi được giảm 50% 1 buổi
     */
    public int calculateDiscountSessions(int totalSessions) {
        return totalSessions / 12;
    }

    /**
     * Tính tổng phí sau khi áp dụng giảm giá
     */
    public double calculatePackageFee(double originalFee, int totalSessions) {
        int discountSessions = calculateDiscountSessions(totalSessions);
        double totalFee = originalFee * totalSessions;
        double discountAmount = originalFee * 0.5 * discountSessions; // 50% mỗi buổi được giảm
        return totalFee - discountAmount;
    }
}

