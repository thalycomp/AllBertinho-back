import SaleProduct, { findByIdAndDelete } from "../models/SaleProduct";
import Product from "../models/Product";
import * as Yup from "yup";

class SaleProductController {
  async store(req, res) {
    const schemaValidation = Yup.object().shape({
      product: Yup.string().required(),
    });

    const user = req.user.id;

    const checkSchema = await schemaValidation.isValid(req.body);

    const product = req.body.product;

    if (!checkSchema) {
      return res.status(400).json({ error: "validations fails" });
    }

    const sold = await Product.findOne({ _id: product }).sold;

    if (sold) {
      return res.status(400).json({ error: "product already sold" });
    }

    await Product.findOneAndUpdate({ _id: product }, { sold: true });

    try {
      const sale = await SaleProduct.create({
        product,
        user,
      });

      return res.status(200).json(sale);
    } catch (err) {
      return res.status(400).json(err);
    }
  }

  async delete(req, res) {
    const schemaValidation = Yup.object().shape({
      id: Yup.string().required(),
    });

    const checkSchema = await schemaValidation.isValid(req.body);

    if (!checkSchema) {
      return res.status(400).json({ error: "validations fails" });
    }

    const { id } = req.body;
    
    try {
      const sale = await SaleProduct.findByIdAndDelete(id);

      await Product.findOneAndUpdate({ _id: sale.product }, { sold: false });

      return res.status(200).json({ message: "returned purchase" });
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  }

  async show(req, res) {
    const { id } = req.user;

    try {
     const sales = await SaleProduct.find({ user: id }).populate("product");

     return res.status(200).json(sales);
    } catch (err) {
      return res.status(400).json(err);
    }
  }
}

export default new SaleProductController();
