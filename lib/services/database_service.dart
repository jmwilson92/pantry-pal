import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pantry_pal/models/pantry_item.dart';

class DatabaseService {
  late Isar isar;

  Future<void> init() async {
    final dir = await getApplicationDocumentsDirectory();
    isar = await Isar.open(
      [PantryItemSchema],
      directory: dir.path,
    );
  }

  Future<void> addItem(PantryItem item) async {
    await isar.writeTxn(() async {
      await isar.pantryItems.put(item);
    });
  }

  Stream<List<PantryItem>> watchAllItems() {
    return isar.pantryItems.where().watch(fireImmediately: true);
  }

  Future<void> markAsUsed(int id) async {
    await isar.writeTxn(() async {
      final item = await isar.pantryItems.get(id);
      if (item != null) {
        if (item.quantity > 1) {
          item.quantity--;
          await isar.pantryItems.put(item);
        } else {
          await isar.pantryItems.delete(id);
        }
      }
    });
  }
}
