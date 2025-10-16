package fsa.training.tutormatch.controller.booking;

import fsa.training.tutormatch.entity.CancelledBy;
import fsa.training.tutormatch.repository.SessionChangeHistoryRepository;
import fsa.training.tutormatch.service.CancellationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/session")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"})
public class BookingSessionController {

    private final CancellationService cancellationService;
    private final SessionChangeHistoryRepository historyRepository;

    public BookingSessionController(CancellationService cancellationService, SessionChangeHistoryRepository historyRepository) {
        this.cancellationService = cancellationService;
        this.historyRepository = historyRepository;
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelSession(@PathVariable Long id, @RequestParam("actor") CancelledBy actor, @RequestParam(value = "reason", required = false) String reason) {
        cancellationService.cancelSession(id, actor, reason);
        return ResponseEntity.ok().body(java.util.Map.of("success", true));
    }

    @GetMapping("/{id}/change-history")
    public ResponseEntity<?> getChangeHistory(@PathVariable Long id) {
        var list = historyRepository.findBySessionIdOrderByChangedAtDesc(id);
        return ResponseEntity.ok().body(java.util.Map.of("success", true, "data", list));
    }
}


