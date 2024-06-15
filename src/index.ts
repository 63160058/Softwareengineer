import express, { Request, Response, NextFunction } from 'express';
import createError from 'http-errors'
import { PrismaClient } from "@prisma/client"
import bcrypt from 'bcrypt';


const prisma = new PrismaClient();
const app = express();

app.use(express.json());
 
app.get('/', async function (req:Request, res:Response, next:NextFunction) {
    res.json({ message: 'API is working' })
    
})


app.get('/posts', async function (req:Request, res:Response, next:NextFunction) {
    const allPosts = await prisma.posts.findMany()
    res.json(allPosts)
    console.log(allPosts)
}
)


app.get('/showcomment/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseInt(req.params.id);

        // ค้นหาโพสต์ที่มี ID ที่ระบุ
        const post = await prisma.posts.findUnique({
            where: {
                id: id,
            },
            include: {
                comments: true,
            },
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post.comments); 
    } catch (error) {
        next(error);
    }
});

  app.get('/user', async function (req:Request, res:Response, next:NextFunction) {
    const allUsers = await prisma.user.findMany()
    res.json(allUsers)
    console.log(allUsers)
  })



  app.get('/user/:id', async function (req:Request, res:Response, next:NextFunction) {
    const id = req.params.id
    const User = await prisma.user.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    res.json(User)
    console.log(User)
  })


  app.post('/register', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(400);
      throw new Error('Email already in use.');
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
      const user = await prisma.user.create({
        data: {
          username: req.body.username,
          email: email,
          password: hashedPassword,
          fname: req.body.fname, 
          lname: req.body.lname,
          phone: req.body.phone,
        },
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  });


  
  app.post('/login', async function (req: Request, res: Response, next: NextFunction) {
    try {
      const login = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        },
      });
  
      if (!login) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const isValidPassword = await bcrypt.compare(req.body.password, login.password);
  
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      res.json("LOGIN SUCCESSFUL");
    } catch (error) {
      next(error);
    }
  });

  

    app.put('/updatedata/:id', async function (req:Request, res:Response, next:NextFunction) {
        const id = req.params.id
        const { username, email, fname, lname, phone } = req.body
        const User = await prisma.user.update({
            where: {
                id: parseInt(id)
            },
            data: {
                username: username,
                email: email,
                fname: fname,
                lname: lname,
                phone: phone
            }
        })
        res.json(User)
        console.log(User)
    })





    app.put('/updatepasword/:id', async function (req:Request, res:Response, next:NextFunction) {
        const id = req.params.id
        const { password } = req.body
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const User = await prisma.user.update({
            where: {
                id: parseInt(id)
            },
            data: {
                password: hashedPassword
            }
        })
        res.json(User.password)
        console.log(User)
    })

    app.post('/createposts/:id', async function (req:Request, res:Response, next:NextFunction) {
        const id = req.params.id
        const { title, content } = req.body
        const Post = await prisma.posts.create({
            data: {
                title: title,
                content: content,
                userId: parseInt(id)
            }
        })

        res.json(Post)
    })


    app.post('/createcomment/:id', async function (req: Request, res: Response, next: NextFunction) {
        try {
          const id = req.params.id
          const { userId } = req.body;
          const { comment } = req.body;
      
          // ตรวจสอบว่าโพสต์มีอยู่จริง
          const post = await prisma.posts.findUnique({
            where: {
                id: parseInt(id),
            },
          });
      
          if (!post) {
            return res.status(404).json({ message: 'Post not found' });
          }
      
          // สร้างคอมเมนต์ใหม่และเชื่อมโยงกับโพสต์
          const newComment = await prisma.comments.create({
            data: {
              content: comment,
              postId: parseInt(id),
              userId: userId,

            },
          });
      
          res.json(post);
        } catch (error) {
          next(error);
        }
      });


      app.put('/updatepost/:id', async function (req:Request, res:Response, next:NextFunction) {
        const id = req.params.id
        const { title, content } = req.body
        const Post = await prisma.posts.update({
            where: {
                id: parseInt(id)
            },
            data: {
                title: title,
                content: content
            }
        })
        res.json("Update Success")
        console.log(Post)
    }
    )

    app.put('/updatecomment/:id', async function (req:Request, res:Response, next:NextFunction) {
        const id = req.params.id
        const { content } = req.body
        const Comment = await prisma.comments.update({
            where: {
                id: parseInt(id)
            },
            data: {
                content: content
            }
        })
        res.json("Update Success")
        console.log(Comment)
    }
    )


    app.delete('/deletepost/:id', async function (req: Request, res: Response, next: NextFunction) {
        try {
            const postId = parseInt(req.params.id);
    
            // ลบคอมเมนต์ที่เชื่อมโยงกับโพสต์ที่ระบุ
            const deletedComments = await prisma.comments.deleteMany({
                where: {
                    postId: postId,
                },
            });
    
            // ลบโพสต์และรวมการลบคอมเมนต์ที่เชื่อมโยง
            const deletedPost = await prisma.posts.delete({
                where: {
                    id: postId,
                },
                include: {
                    comments: true, 
                },
            });
    
            res.json("Delete Success");
        } catch (error) {
            next(error); 
        }
    });

    app.delete('/deletecomment/:id', async function (req: Request, res: Response, next: NextFunction) {
        try {
            const commentId = parseInt(req.params.id);
    
            // ลบคอมเมนต์ที่ระบุ
            const deletedComment = await prisma.comments.delete({
                where: {
                    id: commentId,
                },
            });
    
            res.json("Delete Success");
        } catch (error) {
            next(error);
        }
    });



app.use((req:Request, res:Response, next:NextFunction) => {
    next(createError(404))
  })

app.listen(5050, function () {
  console.log('CORS-enabled web server listening on port 5050')
})