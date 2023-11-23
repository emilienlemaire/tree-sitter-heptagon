#include <assert.h>
#include <string.h>
#include <wctype.h>
#include <stdio.h>

#include "tree_sitter/parser.h"

enum TokenType { COMMENT };

void *tree_sitter_heptagon_external_scanner_create() { return NULL; }

void tree_sitter_heptagon_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_heptagon_external_scanner_serialize(void *payload, char *buffer) {
  return 0;
}

void tree_sitter_heptagon_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {}

bool tree_sitter_heptagon_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  while (lexer->lookahead == ' ' || lexer->lookahead == '\n') {
    lexer->advance (lexer, true);
  }

  if (valid_symbols[COMMENT] && lexer->lookahead == '(') {
    lexer->advance(lexer, false);
    if (lexer->lookahead != '*') {
      return false;
    }
    
    lexer->advance(lexer, false);
    for(;;) {
      if (lexer->lookahead == '*') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == ')') {
          lexer->result_symbol = COMMENT;
          lexer->advance(lexer, false);
          return true;
        }
      }
      lexer->advance(lexer, false);

      if (lexer->lookahead == '\0' && lexer->eof(lexer)) return false;
    }
  }
  return false;
}
