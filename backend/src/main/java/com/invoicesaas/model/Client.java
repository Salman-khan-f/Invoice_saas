package com.invoicesaas.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "clients")
public class Client {

    @Id
    private String id;

    private String tenantId;

    private String name;

    private String companyName;

    private String email;

    private String phone;

    private String address;

    private String city;

    private String state;

    private String country;

    private String zipCode;

    private String notes;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
