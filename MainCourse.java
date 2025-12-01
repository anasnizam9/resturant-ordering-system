// Inheritance: MainCourse extends MenuItem
public class MainCourse extends MenuItem {
    private String cookingTime;
    private String spiceLevel;
    
    public MainCourse(String id, String name, double price, String description,
                      String cookingTime, String spiceLevel) {
        super(id, name, price, "Main Course", description);
        this.cookingTime = cookingTime;
        this.spiceLevel = spiceLevel;
    }
    
    public String getCookingTime() { return cookingTime; }
    public void setCookingTime(String cookingTime) { this.cookingTime = cookingTime; }
    
    public String getSpiceLevel() { return spiceLevel; }
    public void setSpiceLevel(String spiceLevel) { this.spiceLevel = spiceLevel; }
    
    // Polymorphism: Method Overriding
    @Override
    public String getItemType() {
        return "Main Course";
    }
    
    @Override
    public double calculatePrice(double discount) {
        // Main courses have special discount logic
        if (getPrice() > 20) {
            discount += 5; // Extra 5% discount for expensive items
        }
        return super.calculatePrice(discount);
    }
}
