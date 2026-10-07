#!/usr/bin/env bash
# Use the user-local Ruby installation without changing shell startup files.
set -euo pipefail
project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
ruby_root="${AX_STUDY_RUBY_ROOT:-$HOME/.local/opt/ax-study-ruby}"
if [[ ! -x "$ruby_root/usr/bin/ruby3.3" ]]; then
  printf 'User-local Ruby not found: %s\nUse the standard bundle commands in README.md instead.\n' "$ruby_root" >&2
  exit 1
fi
export LD_LIBRARY_PATH="$ruby_root/usr/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export RUBYLIB="$ruby_root/usr/lib/ruby/3.3.0:$ruby_root/usr/lib/x86_64-linux-gnu/ruby/3.3.0:$ruby_root/usr/lib/ruby/vendor_ruby"
export GEM_HOME="$HOME/.local/share/ax-study-gems"
export GEM_PATH="$GEM_HOME:$ruby_root/usr/lib/ruby/gems/3.3.0"
export PATH="$ruby_root/usr/bin:$GEM_HOME/bin:$PATH"
# Bundler may re-exec Ruby; keep UTF-8 in the inherited environment too.
export LC_ALL=C.UTF-8
cd -- "$project_root"
if [[ $# -eq 0 ]]; then set -- build; fi
exec "$ruby_root/usr/bin/ruby3.3" -E UTF-8:UTF-8 "$ruby_root/usr/bin/bundle" exec jekyll "$@"
