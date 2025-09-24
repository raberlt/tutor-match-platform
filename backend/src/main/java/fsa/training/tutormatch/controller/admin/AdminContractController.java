package fsa.training.tutormatch.controller.admin;

import fsa.training.tutormatch.entity.Contract;
import fsa.training.tutormatch.enums.ContractStatus;
import fsa.training.tutormatch.repository.ContractRepository;
import fsa.training.tutormatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/contracts")
@PreAuthorize("hasRole('ADMIN')")
public class AdminContractController {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy danh sách hợp đồng
     */
    @GetMapping
    public ResponseEntity<?> getContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Contract> contractsPage;

            if (status != null && !status.trim().isEmpty()) {
                ContractStatus contractStatus = ContractStatus.valueOf(status.toUpperCase());
                contractsPage = contractRepository.findByStatus(contractStatus, pageable);
            } else {
                contractsPage = contractRepository.findAll(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("contracts", contractsPage.getContent());
            response.put("currentPage", contractsPage.getNumber());
            response.put("totalItems", contractsPage.getTotalElements());
            response.put("totalPages", contractsPage.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi lấy danh sách hợp đồng: " + e.getMessage())
            );
        }
    }

    /**
     * Tạo hợp đồng mới
     */
    @PostMapping
    public ResponseEntity<?> createContract(@RequestBody Map<String, Object> contractData) {
        try {
            Contract contract = new Contract();
            contract.setContractNumber((String) contractData.get("contractNumber"));
            contract.setStudent(userRepository.findById((Integer) contractData.get("studentId")).orElse(null));
            contract.setTutor(userRepository.findById((Integer) contractData.get("tutorId")).orElse(null));
            contract.setSubject((String) contractData.get("subject"));
            contract.setStartDate(LocalDate.parse((String) contractData.get("startDate")));
            contract.setEndDate(LocalDate.parse((String) contractData.get("endDate")));
            contract.setTotalHours((Integer) contractData.get("totalHours"));
            contract.setHourlyRate(new BigDecimal(contractData.get("hourlyRate").toString()));
            contract.setTotalAmount(contract.getHourlyRate().multiply(BigDecimal.valueOf(contract.getTotalHours())));
            contract.setStatus(ContractStatus.DRAFT);
            contract.setCreatedAt(ZonedDateTime.now());

            contract = contractRepository.save(contract);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã tạo hợp đồng thành công");
            response.put("contract", contract);

            return ResponseEntity.status(201).body(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi tạo hợp đồng: " + e.getMessage())
            );
        }
    }

    /**
     * Cập nhật hợp đồng
     */
    @PutMapping("/{contractId}")
    public ResponseEntity<?> updateContract(@PathVariable Integer contractId, @RequestBody Map<String, Object> contractData) {
        try {
            Optional<Contract> contractOpt = contractRepository.findById(contractId);
            if (contractOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Contract contract = contractOpt.get();
            if (contractData.containsKey("subject")) contract.setSubject((String) contractData.get("subject"));
            if (contractData.containsKey("startDate")) contract.setStartDate(LocalDate.parse((String) contractData.get("startDate")));
            if (contractData.containsKey("endDate")) contract.setEndDate(LocalDate.parse((String) contractData.get("endDate")));
            if (contractData.containsKey("totalHours")) contract.setTotalHours((Integer) contractData.get("totalHours"));
            if (contractData.containsKey("hourlyRate")) contract.setHourlyRate(new BigDecimal(contractData.get("hourlyRate").toString()));
            if (contractData.containsKey("status")) contract.setStatus(ContractStatus.valueOf(((String) contractData.get("status")).toUpperCase()));

            // Recalculate total amount
            contract.setTotalAmount(contract.getHourlyRate().multiply(BigDecimal.valueOf(contract.getTotalHours())));

            contract = contractRepository.save(contract);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cập nhật hợp đồng thành công");
            response.put("contract", contract);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi cập nhật hợp đồng: " + e.getMessage())
            );
        }
    }

    /**
     * Thay đổi trạng thái hợp đồng
     */
    @PutMapping("/{contractId}/status")
    public ResponseEntity<?> changeContractStatus(@PathVariable Integer contractId, @RequestParam String status) {
        try {
            Optional<Contract> contractOpt = contractRepository.findById(contractId);
            if (contractOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Contract contract = contractOpt.get();
            contract.setStatus(ContractStatus.valueOf(status.toUpperCase()));

            if (status.equals("ACTIVE") && contract.getSignedAt() == null) {
                contract.setSignedAt(ZonedDateTime.now());
            } else if (status.equals("COMPLETED")) {
                contract.setCompletedAt(ZonedDateTime.now());
            }

            contract = contractRepository.save(contract);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã thay đổi trạng thái hợp đồng thành công");
            response.put("contract", contract);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi thay đổi trạng thái hợp đồng: " + e.getMessage())
            );
        }
    }

    /**
     * Xóa hợp đồng
     */
    @DeleteMapping("/{contractId}")
    public ResponseEntity<?> deleteContract(@PathVariable Integer contractId) {
        try {
            Optional<Contract> contractOpt = contractRepository.findById(contractId);
            if (contractOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            contractRepository.delete(contractOpt.get());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xóa hợp đồng thành công");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi xóa hợp đồng: " + e.getMessage())
            );
        }
    }
}
