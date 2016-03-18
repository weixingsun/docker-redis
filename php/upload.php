<?php  
include "resize.php"; 
$file_name = $_FILES["file"]["name"];
$file_name_tmp = $_FILES['file']['tmp_name'];
$file_type = $_FILES["file"]["type"];
$file_size = $_FILES["file"]["size"];
//$thumbnail_name = $file_name . "64_64.png";

$full_image_path="full/";
//$thumbnail_image_path="thumbnail/";
//makedir($full_image_path);
//makedir($thumbnail_image_path);

define('ROOT',dirname(__FILE__).'/');  

if ($_FILES["file"]["error"] > 0) {  
    echo "Upload Error, return Code: " . $_FILES["file"]["error"] . "<br />";  
} else {  
    echo "Filename: " . $file_name . "<br />";
    echo "Type: " . $file_type . "<br />";  
    echo "Size: " . ($file_size / 1024) . " Kb<br />";  
    echo "Temp file: " . $file_name_tmp . "<br />";  
    //echo "Thumbnail: " . $thumbnail_image_path . $thumbnail_name . "<br />";  

    //if (file_exists("uploads/" . $_FILES["file"]["name"]))  {  
    //    echo $_FILES["file"]["name"] . " already exists. ";  
    //}  
    //else  
    //{ 
    if(is_uploaded_file($file_name_tmp)){
        $stored_path = ROOT.$full_image_path.basename($file_name);
        if(move_uploaded_file($file_name_tmp,$stored_path)){
          echo "Stored in: " . $stored_path;  
        }else{  
          echo 'Stored failed:file save error';  
        }
    }else{
      echo 'Stored failed:no post';
    }
    //} 
}

//$newsize=new ResizeImage($full_image_path . $file_name, 64, 64, false, $thumbnail_image_path . $thumbnail_name );
?> 
