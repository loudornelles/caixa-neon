import React, { useState, useEffect } from "react";
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
  const [form, setForm] = useState({
    produto: "",
    precoInicial: 0,
    cupom: "",
    desconto: 0,
    precoFinal: 0,
    metodo: "",
    pagamento: 0,
    troco: 0,
  });

  useEffect(() => {
    const precoFinal = form.precoInicial - form.desconto;

    const troco = form.metodo === "Dinheiro" ? form.pagamento - precoFinal : 0;

    setForm((prev) => ({
      ...prev,
      precoFinal,
      troco,
    }));
  }, [form.precoInicial, form.desconto, form.pagamento, form.metodo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: [
        "precoInicial",
        "desconto",
        "precoFinal",
        "pagamento",
        "troco",
      ].includes(name)
        ? parseFloat(value || 0)
        : value,
    }));
  };

  // const calcularFinal = () => {
  //   const precoFinal = form.precoInicial - form.desconto;
  //   const troco = form.pagamento - precoFinal;
  //   setForm((prev) => ({
  //     ...prev,
  //     precoFinal,
  //     troco,
  //   }));
  // };

  const enviarVenda = async () => {
    const idGerado = `VENDA-${Date.now()}`;
    const baseUrl =
      "https://script.google.com/macros/s/AKfycbwy0Lezl06IR-nRrsW-WR6LmapA5YEmawhcL1j5Ci4PKyjjbHoqruIyZC7m5EyJZ5-M/exec";

    const params = new URLSearchParams({
      id: idGerado,
      produto: form.produto,
      precoInicial: form.precoInicial.toString(),
      cupom: form.cupom,
      desconto: form.desconto.toString(),
      precoFinal: form.precoFinal.toString(),
      metodo: form.metodo,
      pagamento: form.pagamento.toString(),
      troco: form.troco.toString(),
    });

    try {
      const res = await fetch(`${baseUrl}?${params.toString()}`);
      const text = await res.text();
      alert("✅ Venda registrada com sucesso!");
      console.log(text);

      setForm({
        produto: "",
        precoInicial: 0,
        cupom: "",
        desconto: 0,
        precoFinal: 0,
        metodo: "",
        pagamento: 0,
        troco: 0,
      });
    } catch (error) {
      alert("❌ Erro ao enviar a venda.");
      console.error(error);
    }
  };

  return (
    <Box
      component={Paper}
      elevation={4}
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 4,
        p: 3,
        borderRadius: 3,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Caixa Neon
      </Typography>

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Produto
      </Typography>
      <Select
        fullWidth
        name="produto"
        value={form.produto}
        onChange={async (e) => {
          const produto = e.target.value;

          try {
            const res = await fetch(
              `https://script.google.com/macros/s/AKfycbwy0Lezl06IR-nRrsW-WR6LmapA5YEmawhcL1j5Ci4PKyjjbHoqruIyZC7m5EyJZ5-M/exec?produto=${encodeURIComponent(
                produto
              )}`
            );
            const data = await res.json();

            setForm((prev) => ({
              ...prev,
              produto,
              precoInicial: parseFloat(data.preco || 0),
              desconto: 0,
              precoFinal: 0,
              troco: 0,
              cupom: "",
            }));
          } catch (error) {
            alert("Erro ao buscar o preço.");
            console.error(error);
          }
        }}
        displayEmpty
      >
        <MenuItem value="" disabled>
          Selecione o Produto
        </MenuItem>
        <MenuItem value="Brigadeiro">Brigadeiro</MenuItem>
        <MenuItem value="Bolo de Chocolate">Bolo de Chocolate</MenuItem>
        <MenuItem value="Doguinho">Doguinho</MenuItem>
        <MenuItem value="Correio Neon">Correio Neon</MenuItem>
        <MenuItem value="Cupcake">Cupcake</MenuItem>
        <MenuItem value="Hambúrguer">Hambúrguer</MenuItem>
        <MenuItem value="Refri (200ml)">Refri (200ml)</MenuItem>
      </Select>

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Cupom
      </Typography>
      <Select
        fullWidth
        name="cupom"
        value={form.cupom}
        onChange={(e) => {
          const cupom = e.target.value;
          let desconto = 0;

          if (cupom === "10%") {
            desconto = form.precoInicial * 0.1;
          } else if (cupom === "2 por 1") {
            desconto = form.precoInicial * 0.5;
          }

          setForm((prev) => ({
            ...prev,
            cupom,
            desconto,
          }));
        }}
        displayEmpty
      >
        <MenuItem value="">Nenhum</MenuItem>
        <MenuItem value="2 por 1">2 por 1</MenuItem>
        <MenuItem value="10%">10%</MenuItem>
      </Select>

      <TextField
        label="Preço Inicial"
        name="precoInicial"
        type="text"
        value={form.precoInicial}
        fullWidth
        margin="normal"
        Input={{ readOnly: true }}
      />

      <TextField
        label="Desconto"
        name="desconto"
        type="text"
        value={form.desconto}
        fullWidth
        margin="normal"
        Input={{ readOnly: true }}
      />

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Método de Pagamento
      </Typography>
      <Select
        fullWidth
        name="metodo"
        value={form.metodo}
        onChange={handleChange}
      >
        <MenuItem value="PIX">PIX</MenuItem>
        <MenuItem value="Dinheiro">Dinheiro</MenuItem>
        <MenuItem value="Cartão">Crédito</MenuItem>
        <MenuItem value="Débito">Débito</MenuItem>
      </Select>

      {form.metodo === "Dinheiro" && (
        <TextField
          label="Pagamento"
          name="pagamento"
          type="number"
          value={form.pagamento}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      )}

      {/* <Button
        variant="outlined"
        fullWidth
        onClick={calcularFinal}
        sx={{ mt: 2 }}
      >
        Calcular Final
      </Button> */}

      <Typography sx={{ mt: 2 }}>
        <strong>💰 Preço Final:</strong> R$ {form.precoFinal.toFixed(2)}
      </Typography>
      <Typography>
        <strong>💵 Troco:</strong> R$ {form.troco.toFixed(2)}
      </Typography>

      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 2 }}
        onClick={enviarVenda}
      >
        Enviar Venda
      </Button>
    </Box>
  );
}
