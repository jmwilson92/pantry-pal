import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:pantry_pal/services/open_food_facts_service.dart';
import 'package:pantry_pal/models/pantry_item.dart';
import 'package:pantry_pal/services/database_service.dart';

class AddItemScreen extends StatefulWidget {
  const AddItemScreen({super.key});

  @override
  State<AddItemScreen> createState() => _AddItemScreenState();
}

class _AddItemScreenState extends State<AddItemScreen> {
  final OpenFoodFactsService _api = OpenFoodFactsService();
  final DatabaseService _db = DatabaseService();
  String? scannedBarcode;
  Map<String, dynamic>? productData;

  @override
  void initState() {
    super.initState();
    _db.init(); // In real app handle properly
  }

  Future<void> scanBarcode() async {
    // In full app use MobileScanner widget or show dialog
    // For demo: simulate scan
    // Real implementation would use MobileScanner
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => MobileScanner(
          onDetect: (capture) async {
            final barcodes = capture.barcodes;
            for (final barcode in barcodes) {
              if (barcode.rawValue != null) {
                final code = barcode.rawValue!;
                setState(() => scannedBarcode = code);
                final data = await _api.lookupBarcode(code);
                if (data != null) setState(() => productData = data);
                Navigator.pop(context);
              }
            }
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Item')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            ElevatedButton(
              onPressed: scanBarcode,
              child: const Text('Scan Barcode'),
            ),
            if (scannedBarcode != null) Text('Scanned: $scannedBarcode'),
            if (productData != null) Text('Item: ${productData!['name']}'),
            // Full form for name, expiry, location would go here in complete app
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Add to DB logic here
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Item added! (demo)')));
                Navigator.pop(context);
              },
              child: const Text('Save Item'),
            ),
          ],
        ),
      ),
    );
  }
}
