import sys
import re

def hex_to_ascii(hex_str) :
    return bytearray.fromhex(hex_str).decode()

def get_string_list(line) :
    var_name = line.split('=')[0].replace('var', '').strip()
    hex_set = line.split('=')[1].replace('[', '').replace(']', '').strip().split(',')
    str_set = []

    for hex in hex_set :
        _hex = hex.replace('\\x', '').replace(';', '').replace(' ', '')
        has_quote = False
        str = None
        if "\"" in _hex :
            _hex = _hex.replace("\"", "")
            has_quote = True

        str = hex_to_ascii(_hex)
        str_set.append("\"{}\"".format(str) if has_quote else str)

    return var_name, str_set

def main(file_path):
    
    new_src_data = []

    with open(file_path, 'r') as f :
        lines = f.readlines()
        var_name, str_list = get_string_list(lines[0])
        lines.pop(0)

        reg_ex = var_name + r"\[([0-9]+)\]"

        for line in lines :

            matches = re.finditer(reg_ex, line, re.MULTILINE)
            _line = line
            for _, match in enumerate(matches, start=1):
                for n in range(0, len(match.groups())):
                    idx = match.groups(n)
                    _line = _line.replace('{}[{}]'.format(var_name, idx[0]), str_list[int(idx[0])])

            new_src_data.append(_line)

    with open(file_path + '_modified.js', 'w+') as f :
        f.writelines(new_src_data)

if __name__ == "__main__":

    file_path = sys.argv[1]

    main(file_path)