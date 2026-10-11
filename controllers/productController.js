const Product = require("../models/product");

exports.getProducts = async (req, res, next) => {
    try {
        const {search,instock,minprice,maxprice,sort}=req.query;
        //const page=Number(req.query.page) || 1;

        const page=Math.max(Number(req.query.page) || 1,1);

        //const limit=Number(req.query.limit) || 5;

        const limit=Math.min(Math.max(Number(req.query.limit) || 5,1),50);

        const filter={};
        if(search){
            const safe=search.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
            filter.name={
                $regex:safe,$options:"i"
            };
        }
        if(instock){
            filter.instock=instock==="true";
        }
        if(minprice || maxprice){
            filter.price={};
            if(minprice) filter.price.$gte=Number(minprice);
            if(maxprice) filter.price.$lte=Number(maxprice);
        }
        const total=await Product.countDocuments(filter);
        const products = await Product.find(filter)
                                      .sort(sort || "-createdAt")
                                      .skip((page-1)*limit)
                                      .limit(limit);
        res.json({total,page,pages:Math.ceil(total/limit),products,});
    } catch(err) {
        next(err);
    }
}

exports.getProduct = async (req, res, next) => {
    try {
        const id = req.params.id;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch(err) {
        next(err);
    }
}

exports.getMyProducts = async (req, res, next) => {
    try {
        const products = await Product.find({createdBy: req.user.id})
        res.status(200).json(products);
    } catch(err) {
        next(err);
    }
}

exports.createProduct = async (req, res, next) => {
   try {
        const {name, price} = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name not found"
            })
        }

        if (!price) {
            return res.status(400).json({
                message: "price not found"
            })
        }

        const product = await Product.create({
            ...req.body, 
            createdBy: req.user.id
        })
        return res.status(201).json(product);
   } catch (err) {
        next(err);
   }
}

exports.updateProduct = async (req, res, next) => {
    try {
        const id = req.params.id;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (String(product.createdBy) !== req.user.id) {
            return res.status(401).json({
                message: "U can change ur own products"
            });
        }

        delete req.body.createdBy

        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            returnDocument: "after",
            runValidators: true
        })
        res.status(200).json(updatedProduct);
    } catch(err) {
        next(err);
    }
}

exports.deleteProduct =  async (req, res, next) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (String(product.createdBy) !== req.user.id) {
            return res.status(401).json({
                message: "u cant' delete other products"
            });
        }
        
        await product.deleteOne();
        res.status(200).json({
            message: "Product deleted successfully"
        })
    } catch (err) {
        next(err);
    }
}