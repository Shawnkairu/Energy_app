from app.store import store


def main() -> None:
    store.reset()
    print(f"Seeded {len(store.list_projects())} demo projects.")


if __name__ == "__main__":
    main()
