import 'package:flutter/material.dart';
import 'package:pantry_pal/models/pantry_item.dart';
import 'package:pantry_pal/services/database_service.dart';
import 'package:pantry_pal/screens/scan_screen.dart';

class AddItemScreen extends StatefulWidget {
  const AddItemScreen({super.key});

  @override
  State<AddItemScreen> createState() => _AddItemScreenState();
}

class _AddItemScreenState extends State<AddItemScreen> {
  final DatabaseService _db = DatabaseService();
  final _formKey = GlobalKey<FormState>();

  String name = '';
  String barcode = '';
  String location = 'Pantry';
  int quantity = 1;
  DateTime? expiryDate;
  bool hasExpiry = true;
  String? imageUrl;

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _db.init();
  }

  Future<void> _scanBarcode() async {
    final result = await Navigator.push<Map<String, dynamic>>(
      context,
      MaterialPageRoute(builder: (_) => const ScanScreen()),
    );

    if (result != null && mounted) {
      setState(() {
        barcode = result['barcode'] ?? '';
        name = result['name'] ?? 'Unknown Item';
        imageUrl = result['image'];
      });
    }
  }

  Future<void> _pickExpiryDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 7)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
    );
    if (picked != null) {
      setState(() {
        expiryDate = picked;
        hasExpiry = true;
      });
    }
  }

  Future<void> _saveItem() async {
    if (name.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter an item name')));
      return;
    }

    setState(() => _isLoading = true);

    final item = PantryItem(
      barcode: barcode.isNotEmpty ? barcode : null,
      name: name.trim(),
      location: location,
      quantity: quantity,
      expiryDate: hasExpiry ? expiryDate : null,
      hasExpiry: hasExpiry,
    );

    await _db.addItem(item);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$name added to $location!')));
      Navigator.pop(context);
    }

    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add to Pantry')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ElevatedButton.icon(
                onPressed: _scanBarcode,
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('Scan Barcode'),
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), backgroundColor: Colors.green),
              ),
              const SizedBox(height: 24),

              if (name.isNotEmpty) ...[
                if (imageUrl != null)
                  ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.network(imageUrl!, height: 180, fit: BoxFit.cover)),
                const SizedBox(height: 16),
                Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                if (barcode.isNotEmpty) Text('Barcode: $barcode', style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 24),
              ],

              TextFormField(
                initialValue: name,
                decoration: const InputDecoration(labelText: 'Item Name', border: OutlineInputBorder(), prefixIcon: Icon(Icons.label)),
                onChanged: (val) => name = val,
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  const Text('Quantity:', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: 12),
                  IconButton(onPressed: () => setState(() => quantity = (quantity > 1) ? quantity - 1 : 1), icon: const Icon(Icons.remove_circle_outline)),
                  Text('$quantity', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  IconButton(onPressed: () => setState(() => quantity++), icon: const Icon(Icons.add_circle_outline)),
                ],
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                value: location,
                decoration: const InputDecoration(labelText: 'Location', border: OutlineInputBorder(), prefixIcon: Icon(Icons.place)),
                items: const [
                  DropdownMenuItem(value: 'Pantry', child: Text('Pantry')),
                  DropdownMenuItem(value: 'Fridge', child: Text('Fridge')),
                  DropdownMenuItem(value: 'Freezer', child: Text('Freezer')),
                ],
                onChanged: (val) => setState(() => location = val!),
              ),
              const SizedBox(height: 24),

              SwitchListTile(
                title: const Text('Has expiration date'),
                value: hasExpiry,
                onChanged: (val) => setState(() => hasExpiry = val),
                secondary: const Icon(Icons.event),
              ),
              if (hasExpiry)
                ListTile(
                  leading: const Icon(Icons.calendar_today),
                  title: Text(expiryDate == null ? 'Select expiration date' : 'Expires: ${expiryDate!.day}/${expiryDate!.month}/${expiryDate!.year}'),
                  trailing: const Icon(Icons.edit),
                  onTap: _pickExpiryDate,
                  tileColor: Colors.grey[100],
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),

              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: _isLoading ? null : _saveItem,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 18), backgroundColor: Colors.green[700]),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('ADD TO PANTRY', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}