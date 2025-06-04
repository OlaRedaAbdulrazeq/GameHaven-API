class ApiResponse {
  // This is implemented as a class to encapsulate the structure and behavior of an API response.
  // Using a class allows for better organization, reusability, and the ability to extend functionality in the future.
  // If this were implemented as a function, it would simply return an object with the same properties,
  // but it would lack the ability to easily add methods or extend behavior in a structured way.
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export default ApiResponse;
