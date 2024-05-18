import json

with open("package.json", "r") as f:
    data = f.read()

data = json.loads(data)

before = data["version"]

version = data["version"].split(".")
version[2] = str(int(version[2]) + 1)
version = ".".join(version)

data["version"] = version

after = data["version"]

with open("package.json", "w") as f:
    f.write(json.dumps(data, indent=2) + "\n")

commit = f"package.json: Bumped version from {before} to {after}"

with open("commit_message.txt", "w") as f:
    f.write(commit)
