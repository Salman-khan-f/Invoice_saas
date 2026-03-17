package com.invoicesaas.controller;

import com.invoicesaas.dto.response.ApiResponse;
import com.invoicesaas.dto.response.DashboardStats;
import com.invoicesaas.model.User;
import com.invoicesaas.repository.UserRepository;
import com.invoicesaas.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStats>> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        DashboardStats stats = dashboardService.getStats(user.getTenantId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
