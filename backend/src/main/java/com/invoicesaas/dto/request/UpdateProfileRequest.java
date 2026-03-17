package com.invoicesaas.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String companyName;
    private String phone;
    private String address;
}
