package com.restaurant;

// Encapsulation with private fields
public class User {
    private String userId;
    private String name;
    private String email;
    private String phone;
    
    public User(String userId, String name, String email, String phone) {
        this.userId = userId;
        this.name = name;
        setEmail(email); // Use setter for validation
        setPhone(phone);
    }
    
    // Getters and Setters with validation
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getName() { return name; }
    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }
        this.name = name;
    }
    
    public String getEmail() { return email; }
    public void setEmail(String email) {
        // Data Validation
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email address");
        }
        this.email = email;
    }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) {
        // Data Validation
        if (phone == null || phone.length() < 10) {
            throw new IllegalArgumentException("Phone number must be at least 10 digits");
        }
        this.phone = phone;
    }
    
    @Override
    public String toString() {
        return String.format("User[%s]: %s (%s)", userId, name, email);
    }
}
