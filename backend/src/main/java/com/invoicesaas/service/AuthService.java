package com.invoicesaas.service;

import com.invoicesaas.dto.request.AuthRequest;
import com.invoicesaas.dto.response.AuthResponse;
import com.invoicesaas.exception.BadRequestException;
import com.invoicesaas.model.User;
import com.invoicesaas.repository.UserRepository;
import com.invoicesaas.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(AuthRequest.Register request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        String tenantId = UUID.randomUUID().toString();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .companyName(request.getCompanyName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .tenantId(tenantId)
                .roles(Set.of("USER"))
                .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail(), tenantId);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .companyName(user.getCompanyName())
                .tenantId(user.getTenantId())
                .build();
    }

    public AuthResponse login(AuthRequest.Login request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getTenantId());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .companyName(user.getCompanyName())
                .tenantId(user.getTenantId())
                .build();
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
