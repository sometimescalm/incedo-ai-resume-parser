import click
import os
from gemini_parser import parse_resume_with_gemini
from formatters.resume_formatter import ResumeFormatter

@click.command()
@click.argument('input_file', type=click.Path(exists=True))
@click.option('--output', '-o', type=click.Path(), help='Output file path')
@click.option('--logo', type=click.Path(exists=True), help='Path to logo image for header/footer in DOCX')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose output')
def main(input_file, output, logo, verbose):
    if verbose:
        click.echo(f"Processing file: {input_file}")
    try:
        data = parse_resume_with_gemini(input_file)
        if verbose:
            click.echo(f"Parsed data: {data}")
            import pprint
            pprint.pprint(data)
        formatter = ResumeFormatter()
        template_path = os.path.join('templates', 'resume_builder_template.txt')
        output_path = output if output else 'output_resume.txt'
        if output_path.lower().endswith('.docx'):
            docx_template = os.path.join('templates', 'Resume_Template_With_Logo.docx')
            doc = formatter.format_resume_docx(data, docx_template)
            doc.save(output_path)
            if verbose:
                click.echo(f"DOCX output written to: {output_path}")
        else:
            if os.path.exists(template_path):
                result = formatter.format_resume_txt(data, template_path)
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(result)
                if verbose:
                    click.echo(f"Output written to: {output_path}")
            else:
                click.echo(f"TXT template not found, skipping TXT output.", err=True)
    except Exception as e:
        click.echo(f"Error processing resume: {str(e)}", err=True)
        if verbose:
            raise

if __name__ == "__main__":
    main()