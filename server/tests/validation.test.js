// tests/validation.test.js
import { tinApplicationSchema } from "../src/validators/tinApplicationValidator.js";

describe("TIN Application Validation", () => {
  //TEST 1: Perfect valid data
  it("should accept valid TIN application data", () => {
    const validData = {
      formData: {
        personal: {
          firstName: "John",
          middleName: "Michael",
          lastName: "Doe",
          dateOfBirth: "05/15/1990",
          gender: "Male",
          bankAccountNumber: "1234567890",
          FAN: "FAN12345678",
          email: "john@example.com",
        },
        employmentDetails: {
          occupation: "Software Engineer",
          employerName: "Tech Corp",
          employerAddress: "Addis Ababa",
        },
        addressDetails: {
          streetAddress: "123 Main St",
          city: "Addis Ababa",
          region: "Addis Ababa",
          postalCode: 1000,
        },
        subCity: "Bole",
      },
    };

    const { error, value } = tinApplicationSchema.validate(validData);

    expect(error).toBeUndefined();
    expect(value).toBeDefined();
  });

  // TEST 2: Missing required field
  it("should reject missing firstName", () => {
    const invalidData = {
      formData: {
        personal: {
          // firstName is missing!
          lastName: "Doe",
          dateOfBirth: "05/15/1990",
          gender: "Male",
          bankAccountNumber: "1234567890",
          FAN: "FAN12345678",
          email: "john@example.com",
        },
        // ... other sections
        subCity: "Bole",
      },
    };

    const { error } = tinApplicationSchema.validate(invalidData);

    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("First name");
  });

  //TEST 3: Invalid email format
  it("should reject invalid email", () => {
    const invalidData = {
      formData: {
        personal: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "05/15/1990",
          gender: "Male",
          bankAccountNumber: "1234567890",
          FAN: "FAN12345678",
          email: "not-an-email", // 🎯 Invalid!
        },
        // ... other sections
        subCity: "Bole",
      },
    };

    const { error } = tinApplicationSchema.validate(invalidData);

    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("email");
  });
});
