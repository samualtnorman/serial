let inherit (import <nixpkgs> {}) fetchFromGitHub mkShellNoCC cacert git; in

let fetchNixpkgs =
	{ rev, sha256 ? "" }: import (fetchFromGitHub { owner = "NixOS"; repo = "nixpkgs"; inherit rev sha256; }) {}; in

let inherit (fetchNixpkgs {
	rev = "1d3aeb5a193b9ff13f63f4d9cc169fb88129f860"; # 24.11 2025/05/07
	sha256 = "QkNoyEf6TbaTW5UZYX0OkwIJ/ZMeKSSoOMnSDPQuol0=";
}) nodejs_22 pnpm_10; in

mkShellNoCC { packages = [ cacert git nodejs_22 pnpm_10 ]; }
