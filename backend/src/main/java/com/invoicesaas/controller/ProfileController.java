package com.invoicesaas.controller;

import com.invoicesaas.dto.request.UpdateProfileRequest;
import com.invoicesaas.dto.response.ApiResponse;
import com.invoicesaas.model.User;
import com.invoicesaas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<User>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        user.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        if (request.getName() != null) user.setName(request.getName());
        if (request.getCompanyName() != null) user.setCompanyName(request.getCompanyName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        userRepository.save(user);
        user.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", user));
    }
}
