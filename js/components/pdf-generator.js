// Generador de PDF para cotizaciones
const cotizacionPDF = {
    generarPDF: function(cotizacion) {
        // Crear una nueva instancia de jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración de márgenes y posiciones
        const margin = 15;
        let y = margin;
        
        // Título "COTIZACIÓN"
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("COTIZACIÓN :", 140, y);
        doc.text(cotizacion.numero, 175, y);
        
        // Logo o nombre de la empresa
        doc.setFontSize(20);
        doc.setTextColor(200, 0, 0); // Rojo
        doc.text("MAQUIPAN", margin, y + 15);
        doc.setTextColor(0, 0, 0); // Negro
        
        // Información de la empresa
        y += 25;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Comercializadora Maquipan Chile SPA RUT 96.702.420-1", margin, y);
        y += 5;
        doc.text("Venta de máquinas y servicio técnico", margin, y);
        y += 5;
        doc.text("Av. Don Luis Nº 644 - Parque Industrial Valle Grande Lampa", margin, y);
        y += 5;
        doc.text("Mesa Central +56 2 27471452 Fax: +056 2 7471453", margin, y);
        y += 5;
        doc.text("http://www.maquipan.cl", margin, y);
        
        // Fecha
        doc.text("FECHA : " + cotizacion.fecha, 140, y);
        
        // Línea separadora
        y += 10;
        doc.setLineWidth(0.5);
        doc.line(margin, y, 195, y);
        
        // Información del cliente
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text("RAZON SOCIAL:", margin, y);
        doc.text("R.U.T.:", 140, y);
        doc.setFont("helvetica", "normal");
        doc.text(cotizacion.cliente, margin + 35, y);
        doc.text(cotizacion.rut || "", 155, y);
        
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text("DIRECCIÓN:", margin, y);
        doc.text("VENDEDOR:", 140, y);
        doc.setFont("helvetica", "normal");
        doc.text(cotizacion.direccion || "", margin + 25, y);
        doc.text(cotizacion.vendedor || "Claudio Arnoldo Gaete", 165, y);
        
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text("CIUDAD:", margin, y);
        doc.text("E-MAIL:", 140, y);
        doc.setFont("helvetica", "normal");
        doc.text(cotizacion.ciudad || "SANTIAGO", margin + 18, y);
        doc.text(cotizacion.email || "", 155, y);
        
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text("PAIS:", margin, y);
        doc.text("TELEFONO:", 140, y);
        doc.setFont("helvetica", "normal");
        doc.text("CHILE", margin + 12, y);
        doc.text(cotizacion.telefono || "", 165, y);
        
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text("CONTACTO:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(cotizacion.contacto || "", margin + 25, y);
        
        // Tabla de productos
        y += 15;
        doc.setFont("helvetica", "bold");
        doc.text("Codigo", margin, y);
        doc.text("Cantidad", 50, y);
        doc.text("Descripción", 70, y);
        doc.text("P.Unit", 130, y);
        doc.text("Descuento%", 150, y);
        doc.text("Valor Total", 175, y);
        
        // Línea de encabezado de tabla
        y += 2;
        doc.line(margin, y, 195, y);
        
        y += 7;
        doc.setFont("helvetica", "normal");
        
        // Productos
        if (cotizacion.productos && cotizacion.productos.length > 0) {
            cotizacion.productos.forEach(producto => {
                doc.text(producto.codigo || "", margin, y);
                doc.text(producto.cantidad.toString(), 50, y);
                doc.text(producto.descripcion || "", 70, y);
                doc.text(producto.precioUnitario.toLocaleString('es-CL'), 130, y);
                doc.text(producto.descuento ? producto.descuento + "%" : "0%", 150, y);
                doc.text(producto.total.toLocaleString('es-CL'), 175, y);
                y += 7;
            });
        }
        
        // Línea final de tabla
        doc.line(margin, y, 195, y);
        
        // Totales
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text("Sub Total", 150, y);
        doc.text(cotizacion.subtotal.toLocaleString('es-CL'), 175, y);
        
        y += 7;
        doc.text("Descuento", 150, y);
        doc.text((cotizacion.descuento || 0).toLocaleString('es-CL'), 175, y);
        
        y += 7;
        doc.text("Iva", 150, y);
        doc.text(cotizacion.iva.toLocaleString('es-CL'), 175, y);
        
        y += 7;
        doc.text("Total", 150, y);
        doc.text(cotizacion.total.toLocaleString('es-CL'), 175, y);
        
        // Observaciones
        y += 15;
        doc.setFont("helvetica", "bold");
        doc.text("OBSERVACIONES", margin, y);
        doc.setFont("helvetica", "normal");
        y += 7;
        if (cotizacion.observaciones) {
            const lines = doc.splitTextToSize(cotizacion.observaciones, 180);
            doc.text(lines, margin, y);
            y += lines.length * 7;
        }
        
        // Información adicional
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text("FORMA DE PAGO:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(cotizacion.formaPago || "Crédito 30 días", margin + 40, y);
        
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text("VALIDEZ DE COTIZACION:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(cotizacion.validez || "15 días", margin + 55, y);
        
        // Firma
        y += 20;
        doc.line(margin, y, margin + 60, y);
        doc.text("FIRMA DEL VENDEDOR", margin, y + 5);
        
        // Disclaimer
        doc.setFontSize(8);
        doc.text("**Se excluye todo lo no expresado en esta cotizacion **", 70, 280);
        
        // Guardar el PDF
        doc.save(`cotizacion_${cotizacion.numero}.pdf`);
    }
};
