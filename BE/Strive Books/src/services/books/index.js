const express = require("express")
const {join} = require("path")
const uniqid = require("uniqid")

const { getBooks, writeBooks } = require("../../fsUtilities")

const booksFilePath = join(__dirname, 'books.json')

const booksRouter = express.Router()

booksRouter.get("/", async (req, res, next) => {
  try {
    const books = await getBooks()

    if (req.query && req.query.category) {
      const filteredBooks = books.filter(
        book =>
          book.hasOwnProperty("category") &&
          book.category === req.query.category
      )
      res.send(filteredBooks)
    } else {
      res.send(books)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

booksRouter.get("/:asin", async (req, res, next) => {
  try {
    const books = await getBooks()

    const bookFound = books.find(book => book.asin === req.params.asin)

    if (bookFound) {
      res.send(bookFound)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

booksRouter.post("/", async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const error = new Error()
      error.message = errors
      error.httpStatusCode = 400
      next(error)
    } else {
      const books = await getBooks()

      const asinFound = books.find(book => book.asin === req.body.asin)

      if (asinFound) {
        const error = new Error()
        error.httpStatusCode = 400
        error.message = "Book already in db"
        next(error)
      } else {
        books.push({...req.body, comments: []})
        await writeBooks(books)
        res.status(201).send({ asin: req.body.asin })
      }
    }
  } catch (error) {
    console.log(error)
    const err = new Error("An error occurred while reading from the file")
    next(err)
  }
})

booksRouter.put("/:asin", async (req, res, next) => {
  try {
    const validatedData = matchedData(req)
    const books = await getBooks()

    const bookIndex = books.findIndex(book => book.asin === req.params.asin)

    if (bookIndex !== -1) {
      // book found
      const updatedBooks = [
        ...books.slice(0, bookIndex),
        { ...books[bookIndex], ...validatedData },
        ...books.slice(bookIndex + 1),
      ]
      await writeBooks(updatedBooks)
      res.send(updatedBooks)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    console.log(error)
    const err = new Error("An error occurred while reading from the file")
    next(err)
  }
})

booksRouter.delete("/:asin", async (req, res, next) => {
  try {
    const books = await getBooks()

    const bookFound = books.find(book => book.asin === req.params.asin)

    if (bookFound) {
      const filteredBooks = books.filter(book => book.asin !== req.params.asin)

      await writeBooks(filteredBooks)
      res.status(204).send()
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

booksRouter.get("/:id/comment", async (req, res, next) => {
  try {
    const books = await getBooks()

    const bookFound = books.find(
      book => book.asin === req.params.id
    )

    if (bookFound) {
      res.send(bookFound.comments)
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

booksRouter.post(
  "/:id/comment",
  async (req, res, next) => {
    try {
      const books = await getBooks()

      const bookIndex = books.findIndex(
        book => book.asin === req.params.id
      )

      if (bookIndex !== -1) {
        // product found
        console.log("book found")
        books[bookIndex].comments.push({
          ...req.body,
          _id: uniqid(),
          createdAt: new Date()
        })
        await writeBooks(books)
        res.status(201).send(books)
      } else {
        // product not found
        const error = new Error()
        error.httpStatusCode = 404
        next(error)
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

 booksRouter.delete( "/:commentId", async (req, res, next) => {
    try {
      
      const books = await getBooks()
      console.log(books)
      // const bookIndex = books.findIndex(
      //   book => req.query.commentId === book.comments.forEach(comment => {
      //     comment._id === req.query.commentId
      //     console.log("comment::::::::", comment)
      //   })
      // )

      const bookIndex = "1";
      console.log("bookIndex::::::::::::", bookIndex)
  
      if (bookIndex !== -1) {
        books[bookIndex].comments = books[bookIndex].comments.filter(
          comment => comment._id !== req.params.commentId
        )
        await writeBooks(books)
        res.send(books)
      } else {
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

module.exports = booksRouter
