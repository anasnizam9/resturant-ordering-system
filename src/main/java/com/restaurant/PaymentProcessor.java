package com.restaurant;

// Custom Interface demonstrating Abstraction
public interface PaymentProcessor {
    boolean processPayment(double amount);
    String getPaymentMethod();
    boolean refund(double amount);
}
