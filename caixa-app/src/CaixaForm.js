import React, { useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

export default function CaixaForm() {
  const [cliente, setCliente] = useState("");
  const [produtoAtual, setProdutoAtual] = useState({
    produto: "",
    quantidade: 1,
    precoUnitario: 0,
    cupom: "",
    desconto: 0,
  });

  const [itens, setItens] = useState([]);
  const [metodo, setMetodo] = useState("");
  const [pagamento, setPagamento] = useState(0);

  const handleProdutoChange = (e) => {
    const { name, value } = e.target;
    setProdutoAtual((prev) => ({
      ...prev,
      [name]: ["quantidade", "precoUnitario", "desconto"].includes(name)
        ? parseFloat(value || 0)
        : value,
    }));
  };

  const aplicarCupom = () => {
    let desconto = 0;
    if (produtoAtual.cupom === "10%") {
      desconto = produtoAtual.precoUnitario * 0.1;
    } else if (produtoAtual.cupom === "2 por 1") {
      desconto = produtoAtual.precoUnitario;
    }
    setProdutoAtual((prev) => ({ ...prev, desconto }));
  };

  const adicionarProduto = () => {
    if (!produtoAtual.produto || produtoAtual.quantidade < 1) return;

    const precoTotal =
      produtoAtual.precoUnitario * produtoAtual.quantidade -
      produtoAtual.desconto;

    const novoItem = {
      ...produtoAtual,
      precoTotal,
    };

    setItens((prev) => [...prev, novoItem]);

    setProdutoAtual({
      produto: "",
      quantidade: 1,
      precoUnitario: 0,
      cupom: "",
      desconto: 0,
    });
  };

  const precoFinal = itens.reduce((acc, item) => acc + item.precoTotal, 0);
  const troco = metodo === "Dinheiro" ? pagamento - precoFinal : 0;

  const removerItem = (index) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  };

  const gerarPedidoId = () => {
    const nomeFormatado = cliente.trim().toLowerCase().replace(/\s+/g, "-");
    const sufixo = Math.floor(Math.random() * 1000);
    return `N-${nomeFormatado}-${sufixo}`;
  };

  const enviarVenda = async () => {
    const baseUrl =
      "https://script.google.com/macros/s/AKfycbwy0Lezl06IR-nRrsW-WR6LmapA5YEmawhcL1j5Ci4PKyjjbHoqruIyZC7m5EyJZ5-M/exec";

    const pedidoId = gerarPedidoId();
    try {
      for (const item of itens) {
        for (let i = 0; i < item.quantidade; i++) {
          const params = new URLSearchParams({
            id: pedidoId,
            cliente,
            produto: item.produto,
            quantidade: "1",
            precoInicial: item.precoUnitario.toString(),
            cupom: item.cupom,
            desconto: (item.desconto / item.quantidade).toFixed(2),
            precoFinal: (item.precoTotal / item.quantidade).toFixed(2),
            metodo,
            pagamento:
              metodo === "Dinheiro" ? (pagamento / precoFinal).toFixed(2) : "0",
            troco:
              metodo === "Dinheiro" ? (troco / precoFinal).toFixed(2) : "0",
          });

          await fetch(`${baseUrl}?${params.toString()}`);
        }
      }

      alert("✅ Venda registrada com sucesso!");
      setItens([]);
      setMetodo("");
      setPagamento(0);
      setCliente("");
    } catch (error) {
      alert("❌ Erro ao enviar a venda.");
      console.error(error);
    }
  };

  return (
    <Box
      component={Paper}
      elevation={6}
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: 4,
        borderRadius: 3,
        backgroundColor: "#ffffffff",
        color: "#5d0087ff",
        boxShadow: "0 0 30px #ecc3ffff",
        fontFamily: "monospace",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        fontWeight={300}
        fontFamily={"fantasy"}
        gutterBottom
      >
        Caixa Neon
      </Typography>

      <TextField
        label="Nome do Cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        fullWidth
        margin="normal"
      />

      {/* Seletor de Produto */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Produto
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {[
          "Cachorro-Quente",
          "Brigadeiro",
          "Correio Neon",
          "Cupcake",
          "Doguinho",
          "Hambúrguer",
          "Refri (150ml)",
          "Água Saborizada (150ml)",
          "Tortinha de Limão",
        ].map((nome) => (
          <Button
            key={nome}
            variant={produtoAtual.produto === nome ? "contained" : "outlined"}
            onClick={async () => {
              const res = await fetch(
                `https://script.google.com/macros/s/AKfycbwy0Lezl06IR-nRrsW-WR6LmapA5YEmawhcL1j5Ci4PKyjjbHoqruIyZC7m5EyJZ5-M/exec?produto=${encodeURIComponent(
                  nome
                )}`
              );
              const data = await res.json();
              setProdutoAtual((prev) => ({
                ...prev,
                produto: nome,
                precoUnitario: parseFloat(data.preco || 0),
              }));
            }}
          >
            {nome}
          </Button>
        ))}
      </Box>

      <TextField
        label="Quantidade"
        name="quantidade"
        type="number"
        value={produtoAtual.quantidade}
        onChange={handleProdutoChange}
        fullWidth
        margin="normal"
        inputProps={{ min: 1 }}
      />

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Cupom
      </Typography>
      <Select
        fullWidth
        name="cupom"
        value={produtoAtual.cupom}
        onChange={(e) => {
          setProdutoAtual((prev) => ({ ...prev, cupom: e.target.value }));
        }}
        onBlur={aplicarCupom}
        displayEmpty
      >
        <MenuItem value="">Nenhum</MenuItem>
        <MenuItem value="2 por 1">2 por 1</MenuItem>
        <MenuItem value="10%">10%</MenuItem>
      </Select>

      <Button
        variant="outlined"
        fullWidth
        sx={{ mt: 2 }}
        onClick={adicionarProduto}
        disabled={!produtoAtual.produto || produtoAtual.quantidade < 1}
      >
        Adicionar Produto
      </Button>

      <Typography variant="h6" sx={{ mt: 3 }}>
        Produtos Selecionados
      </Typography>
      {itens.length === 0 && (
        <Typography>Nenhum produto adicionado.</Typography>
      )}
      {itens.map((item, i) => (
        <Box
          key={i}
          sx={{
            my: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2">
            {item.quantidade}x {item.produto} - R$
            {item.precoUnitario.toFixed(2)}{" "}
            {item.cupom &&
              `(Cupom: ${item.cupom}, Desc: R$${item.desconto.toFixed(2)})`}
          </Typography>
          <Button color="error" size="small" onClick={() => removerItem(i)}>
            Remover
          </Button>
        </Box>
      ))}

      <Typography variant="subtitle1" sx={{ mt: 3 }}>
        Método de Pagamento
      </Typography>
      <Select
        fullWidth
        value={metodo}
        onChange={(e) => setMetodo(e.target.value)}
      >
        <MenuItem value="PIX">PIX</MenuItem>
        <MenuItem value="Dinheiro">Dinheiro</MenuItem>
        <MenuItem value="Crédito">Crédito</MenuItem>
        <MenuItem value="Débito">Débito</MenuItem>
      </Select>

      {metodo === "Dinheiro" && (
        <TextField
          label="Pagamento"
          type="number"
          value={pagamento}
          onChange={(e) => setPagamento(parseFloat(e.target.value || 0))}
          fullWidth
          margin="normal"
        />
      )}

      <Typography sx={{ mt: 2 }}>
        <strong>💰 Preço Final:</strong> R$ {precoFinal.toFixed(2)}
      </Typography>
      {metodo === "Dinheiro" && (
        <Typography>
          <strong>💵 Troco:</strong> R$ {troco.toFixed(2)}
        </Typography>
      )}

      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 2 }}
        onClick={enviarVenda}
        disabled={itens.length === 0 || !metodo || !cliente.trim()}
      >
        Enviar Venda
      </Button>
      <Box
        sx={{ mt: 2, textAlign: "center", fontStyle: "italic" }}
        color="text.secondary"
      >
        * Hambúrguer e Cupcake não aceitam "2 por 1". ** Os cupons não são
        cumulativos. *** Lembre que o cupom "2 por 1" requer no mínimos 2 itens
        do mesmo produto. **** Se o valor do produto for 9999, o produto está
        indisponível!
      </Box>
    </Box>
  );
}
