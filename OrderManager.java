// Design Pattern: Observer Pattern
import java.util.*;

// Observer interface
interface OrderObserver {
    void update(String orderId, String status);
}

// Subject class
public class OrderManager {
    private List<OrderObserver> observers = new ArrayList<>();
    private Map<String, Order> orders = new HashMap<>();
    
    // Register observer
    public void addObserver(OrderObserver observer) {
        observers.add(observer);
    }
    
    // Remove observer
    public void removeObserver(OrderObserver observer) {
        observers.remove(observer);
    }
    
    // Notify all observers
    private void notifyObservers(String orderId, String status) {
        for (OrderObserver observer : observers) {
            observer.update(orderId, status);
        }
    }
    
    // Add order
    public void addOrder(Order order) {
        orders.put(order.getOrderId(), order);
        notifyObservers(order.getOrderId(), "Order Created");
    }
    
    // Update order status
    public void updateOrderStatus(String orderId, String newStatus) {
        Order order = orders.get(orderId);
        if (order != null) {
            order.setStatus(newStatus);
            notifyObservers(orderId, newStatus);
        }
    }
    
    public Order getOrder(String orderId) {
        return orders.get(orderId);
    }
}

// Concrete Observer
class NotificationService implements OrderObserver {
    @Override
    public void update(String orderId, String status) {
        System.out.println("Notification: Order " + orderId + " status changed to " + status);
    }
}
