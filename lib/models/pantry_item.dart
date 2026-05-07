import 'package:isar/isar.dart';

part 'pantry_item.g.dart';

@Collection()
class PantryItem {
  Id id = Isar.autoIncrement;

  String? barcode;
  String name;
  String location; // 'Fridge', 'Pantry', 'Freezer'
  int quantity;
  DateTime? expiryDate;
  bool hasExpiry;
  String? notes;

  PantryItem({
    this.barcode,
    required this.name,
    required this.location,
    this.quantity = 1,
    this.expiryDate,
    this.hasExpiry = true,
    this.notes,
  });
}
