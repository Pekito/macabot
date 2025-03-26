{
  description = "macabot";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            dotnet-sdk_9
            dotnet-runtime_9
          ];

          shellHook = ''
            echo "F# development environment ready ^-^"
            echo "run 'dotnet build' to build the project"
            echo "run 'dotnet run' to run the project"
          '';
        };
      });
}
