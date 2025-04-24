import type { Product, Rental, Feedback, User } from "./types"
import { db } from "./db"

// Products
export async function getProducts(category?: string) {
  try {
    let query = "SELECT * FROM Products"
    const params = []

    if (category) {
      query += " WHERE category = ?"
      params.push(category)
    }

    query += " ORDER BY product_id DESC"

    const [rows] = await db.execute(query, params)
    return rows as Product[]
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to fetch products")
  }
}

export async function getProductById(id: number) {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, u.username as owner_name 
       FROM Products p
       JOIN users u ON p.owner_id = u.id
       WHERE p.product_id = ?`,
      [id],
    )

    const products = rows as any[]
    return products.length > 0 ? products[0] : null
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to fetch product")
  }
}

export async function getFeaturedProducts() {
  try {
    const [rows] = await db.execute("SELECT * FROM Products WHERE availibility = 1 LIMIT 8")
    return rows as Product[]
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to fetch featured products")
  }
}

export async function getUserProducts(userId: number) {
  try {
    const [rows] = await db.execute("SELECT * FROM Products WHERE owner_id = ?", [userId])
    return rows as Product[]
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to fetch user products")
  }
}

export async function createProduct(product: Omit<Product, "product_id">) {
  try {
    const [result] = await db.execute(
      `INSERT INTO Products (name, description, price, category, owner_id, availibility) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [product.name, product.description, product.price, product.category, product.owner_id, product.availibility],
    )

    const insertResult = result as any
    return insertResult.insertId
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to create product")
  }
}

export async function updateProduct(product: Product) {
  try {
    await db.execute(
      `UPDATE Products 
       SET name = ?, description = ?, price = ?, category = ?, availibility = ? 
       WHERE product_id = ? AND owner_id = ?`,
      [
        product.name,
        product.description,
        product.price,
        product.category,
        product.availibility,
        product.product_id,
        product.owner_id,
      ],
    )
    return true
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to update product")
  }
}

export async function deleteProduct(productId: number, ownerId: number) {
  try {
    await db.execute("DELETE FROM Products WHERE product_id = ? AND owner_id = ?", [productId, ownerId])
    return true
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to delete product")
  }
}

// Rentals
export async function getRentals(userId: number, isOwner: boolean) {
  try {
    let query = `
      SELECT r.*, p.name as product_name, p.price, u.username as renter_name
      FROM Rentals r
      JOIN Products p ON r.product_id = p.product_id
      JOIN users u ON r.renter_id = u.id
    `

    if (isOwner) {
      query += " WHERE p.owner_id = ?"
    } else {
      query += " WHERE r.renter_id = ?"
    }

    query += " ORDER BY r.rental_id DESC"

    const [rows] = await db.execute(query, [userId])
    return rows as any[]
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to fetch rentals")
  }
}

export async function createRental(rental: Omit<Rental, "rental_id">) {
  try {
    const [result] = await db.execute(
      `INSERT INTO Rentals (product_id, renter_id, start_date, end_date, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [rental.product_id, rental.renter_id, rental.start_date, rental.end_date, rental.status],
    )

    const insertResult = result as any
    return insertResult.insertId
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to create rental")
  }
}

export async function updateRentalStatus(rentalId: number, status: Rental["status"], ownerId: number) {
  try {
    await db.execute(
      `UPDATE Rentals r
       JOIN Products p ON r.product_id = p.product_id
       SET r.status = ?
       WHERE r.rental_id = ? AND p.owner_id = ?`,
      [status, rentalId, ownerId],
    )
    return true
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to update rental status")
  }
}

// Feedback
export async function getProductFeedback(productId: number) {
  try {
    const [rows] = await db.execute("SELECT * FROM Feedback WHERE product_id = ?", [productId])
    return rows as Feedback[]
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to fetch product feedback")
  }
}

export async function createFeedback(feedback: Omit<Feedback, "Feedback_id">) {
  try {
    const [result] = await db.execute(
      `INSERT INTO Feedback (product_id, rating, comment) 
       VALUES (?, ?, ?)`,
      [feedback.product_id, feedback.rating, feedback.comment],
    )

    const insertResult = result as any
    return insertResult.insertId
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to create feedback")
  }
}

// Users
export async function getUserByEmail(email: string) {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email])

    const users = rows as User[]
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to fetch user")
  }
}

export async function createUser(user: Omit<User, "id">) {
  try {
    const [result] = await db.execute(
      `INSERT INTO users (username, email, password, role, is_verified) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        user.username,
        user.email,
        user.password, // Note: In a real app, this should be hashed
        user.role,
        user.is_verified,
      ],
    )

    const insertResult = result as any
    return insertResult.insertId
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to create user")
  }
}
