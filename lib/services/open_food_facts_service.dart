import 'package:http/http.dart' as http;
import 'dart:convert';

class OpenFoodFactsService {
  static const String baseUrl = 'https://world.openfoodfacts.org/api/v2/product';

  Future<Map<String, dynamic>?> lookupBarcode(String barcode) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/$barcode.json'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['status'] == 1 && data['product'] != null) {
          final product = data['product'];
          return {
            'name': product['product_name'] ?? 'Unknown Item',
            'brand': product['brands'] ?? '',
            'image': product['image_url'],
            'nutrients': product['nutriments'] ?? {},
          };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
