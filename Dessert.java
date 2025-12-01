// Inheritance: Dessert extends MenuItem
public class Dessert extends MenuItem {
    private int calories;
    private boolean containsNuts;
    
    public Dessert(String id, String name, double price, String description,
                   int calories, boolean containsNuts) {
        super(id, name, price, "Dessert", description);
        this.calories = calories;
        this.containsNuts = containsNuts;
    }
    
    public int getCalories() { return calories; }
    public void setCalories(int calories) {
        if (calories < 0) {
            throw new IllegalArgumentException("Calories cannot be negative");
        }
        this.calories = calories;
    }
    
    public boolean isContainsNuts() { return containsNuts; }
    public void setContainsNuts(boolean containsNuts) { this.containsNuts = containsNuts; }
    
    // Polymorphism: Method Overriding
    @Override
    public String getItemType() {
        return "Dessert";
    }
    
    @Override
    public String toString() {
        return super.toString() + String.format(" (%d cal)", calories);
    }
}
