import 'package:flutter/material.dart';
import '../../data/repository.dart';
import '../../data/api_client.dart';
import '../../data/models.dart';
import 'user_dashboard.dart';

class UsersPage extends StatefulWidget {
  const UsersPage({super.key});
  @override
  State<UsersPage> createState() => _UsersPageState();
}

class _UsersPageState extends State<UsersPage> {
  late final Repo repo = Repo(ApiClient());
  List<UserConfig> users = [];
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { loading = true; error = null; });
    try {
      users = await repo.fetchUsers();   // pulls from backend or defaults
    } catch (e) {
      error = e.toString();
    } finally {
      if (mounted) setState(() { loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text("LimaBlu — Users")),
        body: Center(child: Text("Failed to load users:\n$error")),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text("LimaBlu — Users")),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: users.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) {
          final u = users[i];
          return ListTile(
            tileColor: Colors.black26,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            title: Text(u.name),
            subtitle: Text("${u.profile}  •  Price ${(u.alpha*100).round()}%"),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => UserDashboard(user: u)),
            ),
          );
        },
      ),
    );
  }
}