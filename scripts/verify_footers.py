import os
import re

def verify_footer_standardization():
    standard_footer_elements = [
        '<footer class="border-t border-slate-800/50 pt-12 pb-8 mt-auto">',
        'href="https://instagram.com/marcelo_rpj"',
        'href="https://www.linkedin.com/in/marcelo-rodrigues-088478211/"',
        'href="mailto:rdpstudio@gmail.com"',
        '© 2025 RDP STUDIO. Todos os direitos reservados.',
        'Desenvolvido com <i class="fa-solid fa-heart text-red-900 animate-pulse"></i> por Marcelo Rodrigues',
        '<div class="watermark-container hidden"></div>'
    ]

    # React/JSX specific elements (class -> className)
    react_footer_elements = [
        '<footer className="border-t border-slate-800/50 pt-12 pb-8 mt-auto">',
        'className="watermark-container hidden"'
    ]

    files_to_check = [
        'hub/index.html',
        'hub/projetos.html',
        'hub/sobre.html',
        'projects/abertura-chamados-glpi/index.html',
        'projects/assistente-vendas-ia/index.html',
        'projects/validador-firewall/index.html'
    ]

    react_files_to_check = [
        'projects/scanner-game-free/js/components/Footer.js'
    ]

    errors = []

    # Check HTML files
    for filepath in files_to_check:
        if not os.path.exists(filepath):
            errors.append(f"File not found: {filepath}")
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        for element in standard_footer_elements:
            # Normalize whitespace for comparison if needed, but strict check is better for standardization
            if element not in content:
                # Allow for slight whitespace variations or ' vs "
                normalized_element = element.replace('"', "'")
                if normalized_element not in content.replace('"', "'"):
                     errors.append(f"Missing element in {filepath}: {element}")

    # Check React files
    for filepath in react_files_to_check:
        if not os.path.exists(filepath):
            errors.append(f"File not found: {filepath}")
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check for shared content (ignoring class vs className for now)
        for element in standard_footer_elements:
            if "class=" in element:
                 continue # Skip class checks here, handled separately

            if element not in content:
                 # Check if it's just the quote style
                normalized_element = element.replace('"', "'")
                if normalized_element not in content.replace('"', "'"):
                     errors.append(f"Missing element in {filepath}: {element}")

        # Check React specific syntax
        for element in react_footer_elements:
             if element not in content:
                  errors.append(f"Missing React element in {filepath}: {element}")

    if errors:
        print("❌ Footer Verification Failed:")
        for error in errors:
            print(f"  - {error}")
        exit(1)
    else:
        print("✅ All footers are standardized!")
        exit(0)

if __name__ == "__main__":
    verify_footer_standardization()
