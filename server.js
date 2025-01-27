import express from "express";
import logger from "morgan";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
app.use(logger("combined"));

// Conectando ao MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/estoque", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

// Modelo de Produto
const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  quantidade: { type: Number, required: true },
  preco: { type: Number, required: true },
  criadoEm: { type: Date, default: Date.now },
  atualizadoEm: { type: Date, default: Date.now },
});

const Produto = mongoose.model("Produto", ProdutoSchema);

// Rotas da API

// Listar todos os produtos
app.get("/produtos", async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.status(200).json(produtos);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar produtos", error: err.message });
  }
});

// Adicionar um novo produto
app.post("/produtos", async (req, res) => {
  try {
    const { nome, quantidade, preco } = req.body;
    const novoProduto = new Produto({ nome, quantidade, preco });
    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (err) {
    res.status(400).json({ message: "Erro ao adicionar produto", error: err.message });
  }
});

// Atualizar um produto pelo ID
app.put("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, quantidade, preco } = req.body;
    const produtoAtualizado = await Produto.findByIdAndUpdate(
      id,
      { nome, quantidade, preco, atualizadoEm: Date.now() },
      { new: true }
    );
    if (!produtoAtualizado) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.status(200).json(produtoAtualizado);
  } catch (err) {
    res.status(400).json({ message: "Erro ao atualizar produto", error: err.message });
  }
});

// Remover um produto pelo ID
app.delete("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const produtoRemovido = await Produto.findByIdAndDelete(id);
    if (!produtoRemovido) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.status(200).json({ message: "Produto removido com sucesso" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao remover produto", error: err.message });
  }
});

// Iniciar o servidor
app.listen(3000, () => console.log("API de Controle de Estoque rodando na porta 3000"));
