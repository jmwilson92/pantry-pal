import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:pantry_pal/services/open_food_facts_service.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with SingleTickerProviderStateMixin {
  final MobileScannerController controller = MobileScannerController();
  final OpenFoodFactsService _api = OpenFoodFactsService();
  late AnimationController _animationController;
  bool _isScanning = true;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    controller.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) async {
    if (!_isScanning) return;
    _isScanning = false;

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        final code = barcode.rawValue!;
        final productData = await _api.lookupBarcode(code);
        if (productData != null) {
          productData['barcode'] = code;
          if (mounted) Navigator.pop(context, productData);
        } else {
          if (mounted) Navigator.pop(context, {'barcode': code, 'name': 'Unknown Item'});
        }
        return;
      }
    }
    _isScanning = true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Barcode'),
        actions: [IconButton(icon: const Icon(Icons.flash_on), onPressed: () => controller.toggleTorch())],
      ),
      body: Stack(
        children: [
          MobileScanner(controller: controller, onDetect: _onDetect),
          AnimatedBuilder(
            animation: _animationController,
            builder: (context, child) {
              return Positioned(
                top: 100 + (MediaQuery.of(context).size.height * 0.4 * _animationController.value),
                left: 40,
                right: 40,
                child: Container(
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.redAccent,
                    boxShadow: [BoxShadow(color: Colors.red.withOpacity(0.8), blurRadius: 12, spreadRadius: 2)],
                  ),
                ),
              );
            },
          ),
          Positioned.fill(child: CustomPaint(painter: ScannerOverlayPainter())),
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(30)),
                child: const Text('Align barcode within the frame', style: TextStyle(color: Colors.white, fontSize: 16)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ScannerOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white..strokeWidth = 3..style = PaintingStyle.stroke;
    final double width = size.width * 0.7;
    final double height = size.height * 0.4;
    final double left = (size.width - width) / 2;
    final double top = size.height * 0.3;
    final double cornerLength = 30;

    canvas.drawLine(Offset(left, top), Offset(left + cornerLength, top), paint);
    canvas.drawLine(Offset(left, top), Offset(left, top + cornerLength), paint);
    canvas.drawLine(Offset(left + width, top), Offset(left + width - cornerLength, top), paint);
    canvas.drawLine(Offset(left + width, top), Offset(left + width, top + cornerLength), paint);
    canvas.drawLine(Offset(left, top + height), Offset(left + cornerLength, top + height), paint);
    canvas.drawLine(Offset(left, top + height), Offset(left, top + height - cornerLength), paint);
    canvas.drawLine(Offset(left + width, top + height), Offset(left + width - cornerLength, top + height), paint);
    canvas.drawLine(Offset(left + width, top + height), Offset(left + width, top + height - cornerLength), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}